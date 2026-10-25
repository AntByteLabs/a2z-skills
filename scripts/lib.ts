/** Shared helpers for the repo scripts. No dependency on Astro's runtime. */
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';

export const ROOT = process.cwd();
export const POSTS_DIR = join(ROOT, 'src/content/posts');
export const PAGES_DIR = join(ROOT, 'src/content/pages');
export const PILLARS_DIR = join(ROOT, 'src/content/pillars');
export const AUTHORS_DIR = join(ROOT, 'src/content/authors');

export type Frontmatter = {
  title?: string;
  seoTitle?: string;
  description?: string;
  pillar?: string;
  type?: string;
  tags?: string[];
  author?: string;
  publishedAt?: string | Date;
  updatedAt?: string | Date;
  testedOn?: {
    date?: string | Date;
    versions?: Record<string, string>;
    device?: string;
    testedBy?: string;
  };
  retestBy?: string | Date;
  quickAnswer?: string;
  faq?: { q: string; a: string }[];
  affiliates?: string[];
  downloads?: { label: string; file: string }[];
  heroImage?: string;
  heroAlt?: string;
  draft?: boolean;
  noindex?: boolean;
  [key: string]: unknown;
};

export type PostFile = {
  slug: string;
  path: string;
  raw: string;
  frontmatter: Frontmatter;
  body: string;
};

export const splitFrontmatter = (raw: string): { head: string; body: string } => {
  if (!raw.startsWith('---')) return { head: '', body: raw };
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return { head: '', body: raw };
  return { head: raw.slice(4, end), body: raw.slice(end + 4) };
};

export const parseFrontmatter = (
  raw: string,
): { frontmatter: Frontmatter; body: string } => {
  const { head, body } = splitFrontmatter(raw);
  if (!head) return { frontmatter: {}, body };
  return { frontmatter: (parseYaml(head) ?? {}) as Frontmatter, body };
};

export const readPosts = async (): Promise<PostFile[]> => {
  const entries = await readdir(POSTS_DIR, { withFileTypes: true });
  const posts: PostFile[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const path = join(POSTS_DIR, entry.name, 'index.mdx');
    let raw: string;
    try {
      raw = await readFile(path, 'utf8');
    } catch {
      continue;
    }
    const { frontmatter, body } = parseFrontmatter(raw);
    posts.push({ slug: entry.name, path, raw, frontmatter, body });
  }
  return posts.sort((a, b) => a.slug.localeCompare(b.slug));
};

export const readIds = async (dir: string, ext: string) =>
  (await readdir(dir)).filter((f) => f.endsWith(ext)).map((f) => f.slice(0, -ext.length));

/**
 * YAML eats `#` as a comment and breaks on `: `, so every string we write into
 * frontmatter is emitted double-quoted.
 */
export const yamlString = (value: string) =>
  `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

export const slugify = (input: string) =>
  input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

/** Words that carry no search intent and only make a slug longer. */
export const STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'how',
  'to',
  'in',
  'on',
  'for',
  'of',
  'and',
  'or',
  'is',
  'are',
  'do',
  'does',
  'my',
  'your',
  'you',
  'with',
  'at',
  'it',
  'this',
  'that',
  'can',
  'i',
  'fix',
  'guide',
  'tutorial',
  'step',
  'steps',
  'best',
  'top',
]);

export const isoDate = (d: Date) => d.toISOString().slice(0, 10);
export const toDate = (v: unknown): Date | undefined => {
  if (v instanceof Date) return v;
  if (typeof v === 'string' || typeof v === 'number') {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }
  return undefined;
};

export const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
export const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
export const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
export const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;
export const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;
