/**
 * Search Console performance, read with a Google service account.
 *
 *   tsx scripts/gsc.ts --sites           properties the account can read, and its role
 *   tsx scripts/gsc.ts                   28-day totals, top queries and top pages
 *   tsx scripts/gsc.ts --days 90         a different window, 1 to 480 days
 *   tsx scripts/gsc.ts --queries         queries only, more rows
 *   tsx scripts/gsc.ts --pages           pages only, more rows
 *   tsx scripts/gsc.ts --limit 50        rows per table
 *   tsx scripts/gsc.ts --json            the raw API response, for piping
 *   tsx scripts/gsc.ts --index           index status of every URL in the sitemap
 *   tsx scripts/gsc.ts --sitemaps        what Search Console holds for the sitemaps
 *   tsx scripts/gsc.ts --submit          ask Google to re-read the sitemaps
 *
 * The credential is read-only (webmasters.readonly) and belongs outside this
 * repo. Set GSC_CLIENT_EMAIL and GSC_PRIVATE_KEY, or point GSC_KEY_FILE at the
 * service account's JSON key. The default path is ~/oracle-free/, which is
 * where this machine already keeps its credentials.
 *
 * Google reports search data two to three days behind, so the most recent days
 * in any window are usually incomplete.
 *
 * --submit needs the read/write scope. Everything else is read-only. Google
 * fetches a submitted sitemap on its own schedule, so a child sitemap can sit
 * at isPending for a while before its URL count catches up.
 */
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createSign } from 'node:crypto';
import { red, green, yellow, dim, bold, isoDate } from './lib';

const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const WRITE_SCOPE = 'https://www.googleapis.com/auth/webmasters';
const INSPECT_URL = 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const API = 'https://www.googleapis.com/webmasters/v3';
const SITE_HOST = 'a2zskillsewa.com';
const DEFAULT_KEY_FILE = join(homedir(), 'oracle-free/gsc-service-account.json');

const args = process.argv.slice(2);
const has = (f: string) => args.includes(`--${f}`);
const value = (f: string): string | undefined => {
  const i = args.indexOf(`--${f}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const number = (f: string, fallback: number, min: number, max: number) => {
  const raw = Number(value(f));
  return Number.isFinite(raw) ? Math.min(max, Math.max(min, Math.trunc(raw))) : fallback;
};

type Credential = { email: string; key: string };

/** Env first, then a JSON key file, so neither has to be edited into the repo. */
const credential = async (): Promise<Credential> => {
  const email = process.env.GSC_CLIENT_EMAIL;
  const key = process.env.GSC_PRIVATE_KEY;
  if (email && key) return { email, key: key.replace(/\\n/g, '\n') };

  const path = process.env.GSC_KEY_FILE ?? DEFAULT_KEY_FILE;
  if (!existsSync(path)) {
    console.error(red('No Search Console credential found.'));
    console.error(dim(`  looked for GSC_CLIENT_EMAIL and GSC_PRIVATE_KEY, then ${path}`));
    console.error(
      dim('  put the service account JSON key at that path, or set GSC_KEY_FILE.'),
    );
    process.exit(1);
  }
  const json = JSON.parse(await readFile(path, 'utf8'));
  if (!json.client_email || !json.private_key) {
    console.error(
      red(`${path} is not a service account key: no client_email or private_key.`),
    );
    process.exit(1);
  }
  return { email: json.client_email, key: json.private_key };
};

const b64url = (input: string | Buffer) =>
  Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

/** A signed JWT exchanged for a bearer token. No dependency beyond node:crypto. */
const accessToken = async (
  { email, key }: Credential,
  scope: string = SCOPE,
): Promise<string> => {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64url(
    JSON.stringify({
      iss: email,
      scope,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    }),
  );
  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${claims}`);
  const assertion = `${header}.${claims}.${b64url(signer.sign(key))}`;

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  const body = await res.json();
  if (!res.ok || !body.access_token) {
    console.error(red(`Token exchange failed: HTTP ${res.status}.`));
    if (body.error_description) console.error(dim(`  ${body.error_description}`));
    console.error(dim('  check the key is current and the clock is right.'));
    process.exit(1);
  }
  return body.access_token as string;
};

type SiteEntry = { siteUrl: string; permissionLevel: string };

const listSites = async (token: string): Promise<SiteEntry[]> => {
  const res = await fetch(`${API}/sites`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    console.error(red(`Could not list sites: HTTP ${res.status} ${res.statusText}.`));
    process.exit(1);
  }
  return ((await res.json()).siteEntry ?? []) as SiteEntry[];
};

/**
 * A property is addressed either as sc-domain:example.com or as a URL prefix,
 * and only the granted form works, so ask the API rather than guessing.
 */
const resolveSite = async (token: string): Promise<string> => {
  if (process.env.GSC_SITE_URL) return process.env.GSC_SITE_URL;
  const sites = await listSites(token);
  const mine = sites.filter((s) => s.siteUrl.includes(SITE_HOST));
  if (!mine.length) {
    console.error(red(`The service account cannot read ${SITE_HOST}.`));
    if (sites.length) {
      console.error(dim('  it can read:'));
      for (const s of sites) console.error(dim(`    ${s.siteUrl}  (${s.permissionLevel})`));
    } else {
      console.error(dim('  it has access to no properties at all.'));
    }
    console.error(
      dim('  add its email in Search Console: Settings, Users and permissions, Add user.'),
    );
    process.exit(1);
  }
  // A domain property covers every subdomain and protocol, so prefer it.
  const chosen = mine.find((s) => s.siteUrl.startsWith('sc-domain:')) ?? mine[0]!;
  if (mine.length > 1) {
    console.log(dim(`${mine.length} matching properties; using ${chosen.siteUrl}.`));
  }
  return chosen.siteUrl;
};

type Row = {
  keys?: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

const query = async (
  token: string,
  site: string,
  body: Record<string, unknown>,
): Promise<Row[]> => {
  const res = await fetch(
    `${API}/sites/${encodeURIComponent(site)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) {
    const detail = await res.text();
    console.error(red(`Query failed: HTTP ${res.status} ${res.statusText}.`));
    console.error(dim(`  ${detail.slice(0, 300)}`));
    process.exit(1);
  }
  return ((await res.json()).rows ?? []) as Row[];
};

const pct = (n: number) => `${(n * 100).toFixed(2)}%`;
const pos = (n: number) => n.toFixed(1);

const table = (title: string, rows: Row[], width: number) => {
  console.log();
  console.log(bold(title));
  if (!rows.length) {
    console.log(dim('  nothing in this window.'));
    return;
  }
  console.log(
    dim(
      `  ${'key'.padEnd(width)}  ${'clicks'.padStart(6)}  ${'impr'.padStart(7)}  ${'ctr'.padStart(7)}  ${'pos'.padStart(5)}`,
    ),
  );
  for (const r of rows) {
    const key = (r.keys?.[0] ?? '').replace(`https://${SITE_HOST}`, '') || '/';
    const label = key.length > width ? `${key.slice(0, width - 1)}…` : key;
    console.log(
      `  ${label.padEnd(width)}  ${String(r.clicks).padStart(6)}  ${String(r.impressions).padStart(7)}  ${pct(r.ctr).padStart(7)}  ${pos(r.position).padStart(5)}`,
    );
  }
};

type SitemapEntry = {
  path: string;
  lastSubmitted?: string;
  lastDownloaded?: string;
  isPending?: boolean;
  isSitemapsIndex?: boolean;
  errors?: string;
  warnings?: string;
  contents?: { type: string; submitted?: string }[];
};

const sitemapState = async (token: string, site: string): Promise<SitemapEntry[]> => {
  const res = await fetch(`${API}/sites/${encodeURIComponent(site)}/sitemaps`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    console.error(red(`Could not read sitemaps: HTTP ${res.status} ${res.statusText}.`));
    process.exit(1);
  }
  return ((await res.json()).sitemap ?? []) as SitemapEntry[];
};

const showSitemaps = (entries: SitemapEntry[]) => {
  if (!entries.length) {
    console.log(yellow('No sitemap is submitted to Search Console.'));
    return;
  }
  for (const e of entries) {
    const errors = Number(e.errors ?? 0);
    const warnings = Number(e.warnings ?? 0);
    console.log(bold(e.path.replace(`https://${SITE_HOST}`, '')));
    console.log(
      dim(
        `  submitted ${e.lastSubmitted?.slice(0, 19) ?? 'never'}   downloaded ${e.lastDownloaded?.slice(0, 19) ?? 'never'}`,
      ),
    );
    const counts = (e.contents ?? [])
      .map((c) => `${c.type} ${c.submitted ?? '?'}`)
      .join(', ');
    console.log(
      `  urls ${counts || 'none reported'}   errors ${errors ? red(String(errors)) : '0'}   warnings ${warnings ? yellow(String(warnings)) : '0'}${e.isPending ? dim('   (queued for fetch)') : ''}`,
    );
  }
};

type Inspection = {
  coverageState?: string;
  lastCrawlTime?: string;
  googleCanonical?: string;
  userCanonical?: string;
};

/**
 * The only way to learn Google's chosen canonical and whether a URL is in the
 * index. Rate limited per property, so this walks the list rather than
 * flooding it.
 */
const inspect = async (
  token: string,
  site: string,
  url: string,
): Promise<Inspection | string> => {
  const res = await fetch(INSPECT_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ inspectionUrl: url, siteUrl: site }),
  });
  if (!res.ok) return `HTTP ${res.status}`;
  return ((await res.json()).inspectionResult?.indexStatusResult ?? {}) as Inspection;
};

const liveSitemapUrls = async (): Promise<string[]> => {
  const res = await fetch(`https://${SITE_HOST}/sitemap-0.xml`, {
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) {
    console.error(red(`Could not read the live sitemap: HTTP ${res.status}.`));
    process.exit(1);
  }
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!);
};

const indexReport = async (token: string, site: string) => {
  const urls = await liveSitemapUrls();
  console.log(dim(`inspecting ${urls.length} URL(s); this takes a moment each.`));
  const states = new Map<string, number>();
  const disagreements: string[] = [];
  const uncrawled: string[] = [];

  for (const url of urls) {
    const r = await inspect(token, site, url);
    const short = url.replace(`https://${SITE_HOST}`, '') || '/';
    if (typeof r === 'string') {
      states.set(r, (states.get(r) ?? 0) + 1);
      console.log(`  ${red(short.padEnd(46))} ${r}`);
      continue;
    }
    const state = r.coverageState ?? 'unknown';
    states.set(state, (states.get(state) ?? 0) + 1);
    const differs = !!r.googleCanonical && r.googleCanonical !== r.userCanonical;
    if (differs) disagreements.push(`${short} -> ${r.googleCanonical}`);
    if (!r.lastCrawlTime) uncrawled.push(short);
    const mark = differs ? red(' canonical differs') : '';
    console.log(
      `  ${short.padEnd(46)} ${(state ?? '').padEnd(26)} ${(r.lastCrawlTime?.slice(0, 10) ?? 'never').padEnd(11)}${mark}`,
    );
    await new Promise((done) => setTimeout(done, 150));
  }

  console.log();
  console.log(bold(`${urls.length} URL(s):`));
  for (const [state, n] of [...states].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(3)}  ${state}`);
  }
  if (disagreements.length) {
    console.log();
    console.log(red(`Google picked a different canonical for ${disagreements.length}:`));
    for (const d of disagreements) console.log(`  ${d}`);
  } else {
    console.log(green('\nNo canonical disagreements.'));
  }
  if (uncrawled.length) {
    console.log(
      dim(`\n${uncrawled.length} not yet crawled, which is normal soon after publishing.`),
    );
  }
};

const run = async () => {
  const token = await accessToken(await credential());

  if (has('sites')) {
    const sites = await listSites(token);
    if (!sites.length) {
      console.log(yellow('The service account has access to no properties.'));
      return;
    }
    console.log(bold(`${sites.length} property/properties readable:`));
    for (const s of sites) {
      const mark = s.siteUrl.includes(SITE_HOST) ? green('  <- A2Z') : '';
      console.log(`  ${s.siteUrl.padEnd(42)} ${s.permissionLevel}${mark}`);
    }
    return;
  }

  const site = await resolveSite(token);

  if (has('sitemaps')) {
    showSitemaps(await sitemapState(token, site));
    return;
  }

  if (has('submit')) {
    // Both the index and the child, because re-reading the index does not make
    // Google re-read what it points at.
    const write = await accessToken(await credential(), WRITE_SCOPE);
    const entries = await sitemapState(token, site);
    const paths = entries.length
      ? entries.map((e) => e.path)
      : [`https://${SITE_HOST}/sitemap-index.xml`, `https://${SITE_HOST}/sitemap-0.xml`];
    for (const path of paths) {
      const res = await fetch(
        `${API}/sites/${encodeURIComponent(site)}/sitemaps/${encodeURIComponent(path)}`,
        { method: 'PUT', headers: { Authorization: `Bearer ${write}` } },
      );
      const label = path.replace(`https://${SITE_HOST}`, '');
      console.log(
        res.ok
          ? green(`submitted ${label}`)
          : red(`${label}: HTTP ${res.status} ${res.statusText}`),
      );
    }
    console.log(dim('Google fetches on its own schedule; check again with --sitemaps.'));
    return;
  }

  if (has('index')) {
    await indexReport(token, site);
    return;
  }

  const days = number('days', 28, 1, 480);
  const limit = number('limit', has('queries') || has('pages') ? 25 : 10, 1, 1000);
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - days);
  const range = { startDate: isoDate(start), endDate: isoDate(end) };

  const wantQueries = has('queries') || !has('pages');
  const wantPages = has('pages') || !has('queries');

  const [totals, queries, pages] = await Promise.all([
    query(token, site, { ...range, dimensions: [] }),
    wantQueries
      ? query(token, site, { ...range, dimensions: ['query'], rowLimit: limit })
      : Promise.resolve([]),
    wantPages
      ? query(token, site, { ...range, dimensions: ['page'], rowLimit: limit })
      : Promise.resolve([]),
  ]);

  if (has('json')) {
    console.log(JSON.stringify({ site, range, totals, queries, pages }, null, 2));
    return;
  }

  const t = totals[0];
  console.log(bold(`${site}`));
  console.log(dim(`${range.startDate} to ${range.endDate}, ${days} days`));
  console.log();
  if (t) {
    console.log(
      `  clicks ${bold(String(t.clicks))}   impressions ${bold(String(t.impressions))}   ctr ${bold(pct(t.ctr))}   avg position ${bold(pos(t.position))}`,
    );
  } else {
    console.log(dim('  no data in this window.'));
  }

  if (wantQueries) table(`Top queries (${queries.length})`, queries, 46);
  if (wantPages) table(`Top pages (${pages.length})`, pages, 46);

  console.log();
  console.log(dim('Google reports two to three days behind; recent days are incomplete.'));
};

run().catch((error) => {
  console.error(red((error as Error).message));
  process.exit(1);
});
