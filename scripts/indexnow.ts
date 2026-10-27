/**
 * IndexNow ping. Bing and the engines sharing its index take changed URLs
 * straight away; Google ignores IndexNow and reads the sitemap instead.
 *
 *   tsx scripts/indexnow.ts --write-key      before the build, writes public/<key>.txt
 *   tsx scripts/indexnow.ts                  after deploy, submits changed URLs
 *   tsx scripts/indexnow.ts --all            submits every URL in the sitemap
 *   tsx scripts/indexnow.ts --snapshot       before deploy, records the live sitemap
 *   tsx scripts/indexnow.ts --dry-run        prints what it would send
 *
 * The key is not a secret — it is served publicly so the engine can verify it —
 * but it is kept in an env var so it is not copied around in the repo.
 */
import { writeFile, readFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { ROOT, red, green, yellow, dim, bold } from './lib';

const ENDPOINT = 'https://api.indexnow.org/indexnow';
const SITE = process.env.SITE_URL ?? 'https://a2zskillsewa.com';
const HOST = new URL(SITE).host;
const fallbackKey = join(ROOT, 'public/indexnow-key.txt');
// Written before a deploy and read straight after it, so a release is still
// submitted when the last commit touched only docs. Not committed.
const SNAPSHOT = join(ROOT, 'node_modules/.cache/indexnow-previous.json');
const KEY =
  process.env.INDEXNOW_KEY ??
  (existsSync(fallbackKey) ? (await readFile(fallbackKey, 'utf8')).trim() : '');

const args = process.argv.slice(2);
const has = (f: string) => args.includes(`--${f}`);

const keyFileName = () => `${KEY}.txt`;

/** Posts changed in the last commit, mapped to their public URL. */
const changedUrls = (): string[] => {
  let files: string[];
  try {
    const range = process.env.GITHUB_EVENT_BEFORE
      ? `${process.env.GITHUB_EVENT_BEFORE}..HEAD`
      : 'HEAD~1..HEAD';
    files = execSync(`git diff --name-only ${range}`, {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim()
      .split('\n')
      .filter(Boolean);
  } catch {
    return [];
  }

  const urls = new Set<string>();
  for (const file of files) {
    const post = file.match(/^src\/content\/posts\/([^/]+)\//);
    if (post) {
      urls.add(`${SITE}/${post[1]}/`);
      continue;
    }
    const page = file.match(/^src\/content\/pages\/([^/]+)\.md$/);
    if (page) urls.add(`${SITE}/${page[1]}/`);
    const pillar = file.match(/^src\/content\/pillars\/([^/]+)\.md$/);
    if (pillar) urls.add(`${SITE}/topics/${pillar[1]}/`);
  }
  // A new or changed post also changes the home page and its hub listing.
  if (urls.size) {
    urls.add(`${SITE}/`);
    urls.add(`${SITE}/topics/`);
  }
  return [...urls];
};

const sitemapUrls = async (): Promise<string[]> => {
  const path = join(ROOT, 'dist/sitemap-0.xml');
  if (!existsSync(path)) return [];
  const xml = await readFile(path, 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!);
};

/** The live sitemap's URLs, recorded before a deploy replaces them. */
const takeSnapshot = async (): Promise<void> => {
  const res = await fetch(`${SITE}/sitemap-0.xml`, {
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`sitemap: ${res.status} ${res.statusText}`);
  const xml = await res.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!);
  await mkdir(join(ROOT, 'node_modules/.cache'), { recursive: true });
  await writeFile(SNAPSHOT, JSON.stringify(urls), 'utf8');
  console.log(dim(`indexnow: recorded ${urls.length} live URL(s) before deploy.`));
};

/** URLs in the built sitemap that the live site did not have. */
const addedSinceSnapshot = async (): Promise<string[]> => {
  if (!existsSync(SNAPSHOT)) return [];
  try {
    const before = new Set<string>(JSON.parse(await readFile(SNAPSHOT, 'utf8')));
    return (await sitemapUrls()).filter((u) => !before.has(u));
  } catch {
    return [];
  }
};

const run = async () => {
  if (!KEY && has('optional')) {
    console.log('indexnow: no key configured; skipped.');
    return;
  }
  if (!KEY) {
    console.error(
      red('INDEXNOW_KEY is not set. Generate one (32+ hex chars) and add it as a secret.'),
    );
    console.error(dim('  openssl rand -hex 16'));
    process.exit(1);
  }
  if (!/^[A-Za-z0-9-]{8,128}$/.test(KEY)) {
    console.error(
      red('INDEXNOW_KEY must be 8 to 128 characters, letters, numbers and hyphens only.'),
    );
    process.exit(1);
  }

  if (has('snapshot')) {
    await takeSnapshot();
    return;
  }

  if (has('write-key')) {
    const path = join(ROOT, 'public', keyFileName());
    await writeFile(path, KEY, 'utf8');
    console.log(green(`wrote public/${keyFileName()}`));
    return;
  }

  // A release followed by a docs-only commit leaves the git diff empty, so the
  // sitemap comparison is what actually catches the new posts.
  const urls = has('all')
    ? await sitemapUrls()
    : [...new Set([...changedUrls(), ...(await addedSinceSnapshot())])];
  if (!urls.length) {
    await rm(SNAPSHOT, { force: true });
    console.log(dim('indexnow: no changed URLs to submit.'));
    return;
  }

  console.log(bold(`indexnow: ${urls.length} URL(s)`));
  for (const u of urls) console.log(dim(`  ${u}`));

  if (has('dry-run')) {
    console.log(yellow('dry run, nothing sent.'));
    return;
  }

  // Consumed once it has been acted on, so a later deploy never compares
  // against a stale list. A dry run leaves it alone.
  await rm(SNAPSHOT, { force: true });

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `${SITE}/${keyFileName()}`,
      urlList: urls.slice(0, 10_000),
    }),
  });

  // 200 accepted, 202 accepted but key still being validated.
  if (res.status === 200 || res.status === 202) {
    console.log(green(`indexnow: ${res.status} ${res.statusText}`));
    return;
  }
  // A failed ping must not fail a deploy that already succeeded.
  console.warn(
    yellow(
      `indexnow: ${res.status} ${res.statusText} — ${(await res.text()).slice(0, 200)}`,
    ),
  );
};

run().catch((error) => {
  console.warn(yellow(`indexnow skipped: ${(error as Error).message}`));
});
