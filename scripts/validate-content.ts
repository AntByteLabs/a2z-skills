/**
 * The quality gate. Runs on every pull request and fails the build on anything
 * that would put a thin, undated or unlinked post in front of a reader.
 *
 * Astro's own schema already enforces field types and lengths. This script
 * checks the things a schema cannot see: links between posts, redirects for
 * renamed slugs, disclosure beside affiliate links, and leftover placeholders.
 */
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  ROOT,
  PAGES_DIR,
  PILLARS_DIR,
  AUTHORS_DIR,
  readPosts,
  readIds,
  toDate,
  isoDate,
  STOP_WORDS,
  red,
  yellow,
  green,
  dim,
  bold,
  type PostFile,
} from './lib';

type Issue = { file: string; rule: string; message: string };

const errors: Issue[] = [];
const warnings: Issue[] = [];

const fail = (file: string, rule: string, message: string) =>
  errors.push({ file, rule, message });
const warn = (file: string, rule: string, message: string) =>
  warnings.push({ file, rule, message });

/** Phrases that mark a draft nobody edited. */
const BANNED = [
  'in today’s fast-paced',
  "in today's fast-paced",
  'in the ever-evolving',
  'it is important to note',
  'it’s important to note',
  'delve into',
  'in conclusion',
  'unlock the power',
  'game-changer',
  'seamlessly',
  'robust solution',
  'cutting-edge',
  'look no further',
  'let’s dive in',
  "let's dive in",
  'at its core',
  'that being said',
  'needless to say',
  'when it comes to',
  'the bottom line is',
  'rest assured',
  'elevate your',
  'navigate the landscape',
  'treasure trove',
  'a testament to',
];

/** Patterns Humanizer exists to remove. Flagged, not blocking, except TODOs. */
const AI_TELLS: { label: string; re: RegExp }[] = [
  {
    label: 'not X but Y',
    re: /\b(?:it(?:'|’)?s|this is) not (?:just|only) (?:a|an|the)?[^.!?]{3,40}(?:,| but| it(?:'|’)?s)/gi,
  },
  {
    label: 'staged run-up',
    re: /\b(?:here(?:'|’)?s the thing|honestly\?|let that sink in|and the best part\?)/gi,
  },
  { label: 'em-dash pile-up', re: /—[^—]{0,80}—/g },
];

const TESTED_TYPES = new Set(['how-to', 'fix', 'review']);
const RETEST_DAYS = 120;

const bodyText = (post: PostFile) =>
  post.body
    // Code, frontmatter and component props are not prose.
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/<[^>]+>/g, ' ');

const internalLinks = (post: PostFile): string[] => {
  const text = post.body;
  const md = [...text.matchAll(/\]\((\/[^)\s]*)\)/g)].map((m) => m[1]!);
  const html = [...text.matchAll(/href=["'](\/[^"']*)["']/g)].map((m) => m[1]!);
  return [...md, ...html];
};

const run = async () => {
  const posts = await readPosts();
  const pillarIds = await readIds(PILLARS_DIR, '.md');
  const authorIds = await readIds(AUTHORS_DIR, '.json');
  const pageIds = await readIds(PAGES_DIR, '.md');
  const postSlugs = new Set(posts.map((p) => p.slug));
  const redirects = existsSync(join(ROOT, 'public/_redirects'))
    ? await readFile(join(ROOT, 'public/_redirects'), 'utf8')
    : '';

  // A page and a post cannot both own the same root path.
  for (const id of pageIds) {
    if (postSlugs.has(id)) {
      fail(
        `src/content/pages/${id}.md`,
        'route-collision',
        `A post also uses /${id}/. One of them must be renamed.`,
      );
    }
  }

  // Every path a post links to must exist somewhere in the build.
  const knownPaths = new Set<string>([
    '/',
    '/topics/',
    '/search/',
    '/thanks/',
    '/rss.xml',
    '/llms.txt',
    ...pillarIds.map((p) => `/topics/${p}/`),
    ...authorIds.map((a) => `/authors/${a}/`),
    ...pageIds.map((p) => `/${p}/`),
    ...[...postSlugs].map((s) => `/${s}/`),
  ]);

  // Count inbound links so orphans can be reported.
  const inbound = new Map<string, number>([...postSlugs].map((s) => [s, 0]));

  for (const post of posts) {
    const f = post.frontmatter;
    const rel = `src/content/posts/${post.slug}/index.mdx`;
    const text = bodyText(post);
    const words = text.trim().split(/\s+/).length;

    // --- Slug rules -------------------------------------------------------
    const parts = post.slug.split('-');
    if (!/^[a-z0-9-]+$/.test(post.slug))
      fail(rel, 'slug', 'Slugs are lowercase letters, numbers and hyphens only.');
    if (parts.length < 3 || parts.length > 6)
      warn(rel, 'slug', `${parts.length} words; aim for 3 to 6 with the keyword first.`);
    if (/(^|-)(19|20)\d{2}(-|$)/.test(post.slug))
      fail(rel, 'slug', 'No years in slugs: the post outlives the year.');
    const stops = parts.filter((w) => STOP_WORDS.has(w));
    if (stops.length) warn(rel, 'slug', `Drop filler words: ${stops.join(', ')}.`);

    // --- Frontmatter the schema cannot check ------------------------------
    if (f.pillar && !pillarIds.includes(f.pillar))
      fail(rel, 'pillar', `Unknown pillar "${f.pillar}".`);
    if (f.author && !authorIds.includes(f.author))
      fail(rel, 'author', `Unknown author "${f.author}".`);

    if (f.type && TESTED_TYPES.has(f.type) && !f.testedOn?.date)
      fail(rel, 'tested-on', `A ${f.type} post must record when it was tested.`);

    if (f.testedOn?.versions && Object.keys(f.testedOn.versions).length === 0)
      fail(rel, 'tested-on', 'testedOn.versions is empty; name the versions you tested.');

    const tested = toDate(f.testedOn?.date);
    const published = toDate(f.publishedAt);
    if (tested && published && tested.getTime() > published.getTime() + 86_400_000)
      fail(rel, 'tested-on', 'Tested date is after the publish date.');

    const retest =
      toDate(f.retestBy) ??
      (tested ? new Date(tested.getTime() + RETEST_DAYS * 86_400_000) : undefined);
    if (retest && retest.getTime() < Date.now() && !f.draft)
      warn(rel, 'stale', `Due for re-test since ${isoDate(retest)}.`);

    if (f.updatedAt && published && toDate(f.updatedAt)! < published)
      fail(rel, 'dates', 'updatedAt is before publishedAt.');

    // --- Substance --------------------------------------------------------
    if (words < 350 && !f.draft)
      fail(rel, 'thin', `${words} words of prose. Under 350 is a thin page.`);

    const h2s = [...post.body.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1]!.trim());
    if (h2s.length < 2 && !f.draft) warn(rel, 'structure', 'Fewer than two H2 sections.');
    if (new Set(h2s).size !== h2s.length)
      fail(rel, 'structure', 'Two H2 headings have the same text.');

    if (f.quickAnswer && f.title && f.quickAnswer.trim() === f.title.trim())
      fail(rel, 'quick-answer', 'The short answer repeats the title.');

    if (f.faq && f.faq.length > 0 && f.faq.length < 3)
      warn(rel, 'faq', 'Either three real follow-up questions, or none.');

    // --- Money ------------------------------------------------------------
    const affiliateLinks = [...post.body.matchAll(/\/go\/([a-z0-9-]+)\//g)].map(
      (m) => m[1]!,
    );
    const declared = new Set(f.affiliates ?? []);
    if (affiliateLinks.length > 0 && declared.size === 0)
      fail(
        rel,
        'disclosure',
        'Affiliate links are present but `affiliates` is empty, so no disclosure renders.',
      );
    for (const slug of new Set(affiliateLinks)) {
      if (!declared.has(slug))
        warn(rel, 'disclosure', `/go/${slug}/ is linked but not listed in affiliates.`);
      if (!new RegExp(`^/go/${slug}/?\\s`, 'm').test(redirects))
        fail(rel, 'redirect', `/go/${slug}/ has no line in public/_redirects.`);
    }

    // --- Links ------------------------------------------------------------
    const links = internalLinks(post);
    for (const link of links) {
      const clean = link.split('#')[0]!.split('?')[0]!;
      if (clean.startsWith('/go/') || clean.startsWith('/downloads/')) continue;
      if (!knownPaths.has(clean))
        fail(rel, 'dead-link', `Links to ${clean}, which no page builds.`);
      const slug = clean.replace(/^\/|\/$/g, '');
      if (inbound.has(slug) && slug !== post.slug)
        inbound.set(slug, inbound.get(slug)! + 1);
    }

    if (f.pillar && !f.draft && !links.some((l) => l.startsWith(`/topics/${f.pillar}`)))
      fail(rel, 'hub-link', `No link back to its hub, /topics/${f.pillar}/.`);

    const related = links.filter((l) => {
      const slug = l.replace(/^\/|\/$/g, '').split('#')[0]!;
      return postSlugs.has(slug) && slug !== post.slug;
    });
    if (new Set(related).size < 2 && !f.draft)
      fail(
        rel,
        'internal-links',
        `${new Set(related).size} links to other posts; two is the minimum.`,
      );

    // --- Files ------------------------------------------------------------
    for (const d of f.downloads ?? []) {
      if (!existsSync(join(ROOT, 'public/downloads', d.file)))
        fail(rel, 'download', `public/downloads/${d.file} is missing.`);
    }

    // --- Prose ------------------------------------------------------------
    const lower = text.toLowerCase();
    for (const phrase of BANNED) {
      if (lower.includes(phrase)) fail(rel, 'filler', `Banned phrase: "${phrase}".`);
    }
    for (const tell of AI_TELLS) {
      const hits = [...text.matchAll(tell.re)];
      if (hits.length)
        warn(
          rel,
          'ai-tell',
          `${tell.label} (${hits.length}). Run /humanizer on this post.`,
        );
    }
    if (/\bTODO\b|\bFIXME\b|\bLorem ipsum\b/i.test(post.raw))
      fail(rel, 'placeholder', 'A TODO, FIXME or Lorem ipsum is still in the file.');
  }

  // --- Authors need a profile link for E-E-A-T ----------------------------
  for (const id of authorIds) {
    const raw = JSON.parse(await readFile(join(AUTHORS_DIR, `${id}.json`), 'utf8')) as {
      sameAs?: string[];
      avatar?: string;
    };
    if (!raw.sameAs?.length)
      warn(
        `src/content/authors/${id}.json`,
        'author-profile',
        'No sameAs link. Add a LinkedIn, GitHub or other profile: it is the strongest author signal there is.',
      );
    if (raw.avatar && raw.avatar.endsWith('.svg'))
      warn(
        `src/content/authors/${id}.json`,
        'author-photo',
        'The avatar is a generated placeholder. A real photograph of the person is worth more.',
      );
  }

  // --- Placeholders anywhere in content ----------------------------------
  for (const [dir, ext, ids] of [
    [PAGES_DIR, '.md', pageIds],
    [PILLARS_DIR, '.md', pillarIds],
    [AUTHORS_DIR, '.json', authorIds],
  ] as const) {
    for (const id of ids) {
      const path = join(dir, `${id}${ext}`);
      const raw = await readFile(path, 'utf8');
      if (/\bTODO\b|\bFIXME\b|\bLorem ipsum\b/i.test(raw))
        fail(
          path.replace(`${ROOT}/`, ''),
          'placeholder',
          'A TODO, FIXME or Lorem ipsum is still in the file.',
        );
    }
  }

  // --- Orphans ------------------------------------------------------------
  const live = posts.filter((p) => !p.frontmatter.draft);
  for (const post of live) {
    if ((inbound.get(post.slug) ?? 0) === 0)
      warn(
        `src/content/posts/${post.slug}/index.mdx`,
        'orphan',
        'No other post links here. Add 2 to 3 links from older posts in the same pillar.',
      );
  }

  // --- Slug changes need a redirect --------------------------------------
  // Compares against the slugs present in the last commit, when git is available.
  const { execSync } = await import('node:child_process');
  try {
    const before = execSync('git ls-tree -d --name-only HEAD src/content/posts/', {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((p) => p.replace('src/content/posts/', ''));
    for (const old of before) {
      if (!postSlugs.has(old) && !new RegExp(`^/${old}/?\\s`, 'm').test(redirects))
        fail(
          'public/_redirects',
          'slug-change',
          `/${old}/ was published and is gone. Add a redirect line in this pull request.`,
        );
    }
  } catch {
    // No git history yet (first commit). Nothing to compare.
  }

  // --- Report -------------------------------------------------------------
  const group = (list: Issue[]) => {
    const byFile = new Map<string, Issue[]>();
    for (const i of list) byFile.set(i.file, [...(byFile.get(i.file) ?? []), i]);
    return byFile;
  };

  if (warnings.length) {
    console.log(bold(`\n${warnings.length} warning${warnings.length === 1 ? '' : 's'}`));
    for (const [file, list] of group(warnings)) {
      console.log(dim(`  ${file}`));
      for (const i of list) console.log(`    ${yellow(i.rule)} ${i.message}`);
    }
  }

  if (errors.length) {
    console.log(bold(`\n${errors.length} error${errors.length === 1 ? '' : 's'}`));
    for (const [file, list] of group(errors)) {
      console.log(dim(`  ${file}`));
      for (const i of list) console.log(`    ${red(i.rule)} ${i.message}`);
    }
    console.log(red(`\nvalidate failed: ${errors.length} error(s)\n`));
    process.exit(1);
  }

  console.log(
    green(`\nvalidate passed: ${posts.length} post(s), ${warnings.length} warning(s)\n`),
  );
};

run().catch((error) => {
  console.error(red(`validate crashed: ${(error as Error).message}`));
  process.exit(1);
});
