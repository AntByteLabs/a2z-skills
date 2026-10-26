/**
 * Post files are MDX with YAML frontmatter. Everything here reads and writes
 * that shape, applying the same rules the repository's validator enforces, so
 * a post created from a chat is the same as one created by hand.
 */
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { listDir, readFile, type Env } from './github';
import { checkArticle, type ContentContext } from '../../src/lib/content-policy';

export const PILLARS = [
  'windows-mac',
  'phones',
  'excel-office',
  'ai-tools',
  'websites-hosting',
  'automation',
] as const;

export const TYPES = [
  'how-to',
  'fix',
  'comparison',
  'review',
  'explainer',
  'list',
  'asset',
] as const;

export const TESTED_TYPES = ['how-to', 'fix', 'review'];

export type Frontmatter = Record<string, unknown>;

const STOP_WORDS = new Set([
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

export const slugify = (input: string) =>
  input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .split(/[\s-]+/)
    .filter((w) => w && !STOP_WORDS.has(w) && !/^(19|20)\d{2}$/.test(w))
    .slice(0, 6)
    .join('-');

export const splitPost = (raw: string) => {
  if (!raw.startsWith('---')) return { frontmatter: {} as Frontmatter, body: raw };
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return { frontmatter: {} as Frontmatter, body: raw };
  return {
    frontmatter: (parseYaml(raw.slice(4, end)) ?? {}) as Frontmatter,
    body: raw.slice(end + 4).replace(/^\n/, ''),
  };
};

/**
 * YAML treats `#` as a comment and breaks on `: `, which silently truncated a
 * description once. Everything is quoted on the way out.
 */
export const joinPost = (frontmatter: Frontmatter, body: string) => {
  const yaml = stringifyYaml(frontmatter, {
    defaultStringType: 'QUOTE_DOUBLE',
    defaultKeyType: 'PLAIN',
    lineWidth: 0,
  });
  return `---\n${yaml}---\n\n${body.replace(/^\n+/, '')}`;
};

export const postPath = (slug: string) => `src/content/posts/${slug}/index.mdx`;

export const listPostSlugs = async (env: Env) =>
  (await listDir(env, 'src/content/posts'))
    .filter((e) => e.type === 'dir')
    .map((e) => e.name)
    .sort();

export const getPost = async (env: Env, slug: string) => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Invalid post slug');
  const file = await readFile(env, postPath(slug));
  if (!file) return null;
  return { slug, ...splitPost(file.text), raw: file.text };
};

/** Shared prose, metadata and publishing checks. */
export const checkPost = checkArticle;

/** Resolve references before a write; a failing published edit never reaches main. */
export const checkBeforeWrite = async (
  env: Env,
  frontmatter: Frontmatter,
  body: string,
  slug: string,
) => {
  const [slugs, authors, pages, redirectFile] = await Promise.all([
    listPostSlugs(env),
    listDir(env, 'src/content/authors'),
    listDir(env, 'src/content/pages'),
    readFile(env, 'public/_redirects'),
  ]);
  const posts = await Promise.all(
    slugs.map(async (id) => (id === slug ? { slug, frontmatter } : getPost(env, id))),
  );
  const context: ContentContext = {
    authors: new Set(authors.map((author) => author.name.replace(/\.json$/, ''))),
    knownPaths: new Set([
      '/',
      '/topics/',
      '/search/',
      '/thanks/',
      '/rss.xml',
      '/llms.txt',
      '/llms-full.txt',
      ...PILLARS.map((pillar) => `/topics/${pillar}/`),
      ...authors.map((author) => `/authors/${author.name.replace(/\.json$/, '')}/`),
      ...pages.map((page) => `/${page.name.replace(/\.md$/, '')}/`),
      ...[...new Set([...slugs, slug])].map((id) => `/${id}/`),
    ]),
    publishedSlugs: new Set(
      posts
        .filter((post) => post && post.frontmatter.draft !== true)
        .map((post) => post!.slug),
    ),
    draftSlugs: new Set(
      posts.filter((post) => post?.frontmatter.draft === true).map((post) => post!.slug),
    ),
    redirects: redirectFile?.text ?? '',
  };
  const check = checkArticle(frontmatter, body, slug, context);
  if (Array.isArray(frontmatter.downloads)) {
    for (const item of frontmatter.downloads) {
      if (
        !item ||
        typeof item.file !== 'string' ||
        !/^[a-zA-Z0-9._-]+$/.test(item.file) ||
        !(await readFile(env, `public/downloads/${item.file}`))
      ) {
        check.problems.push('A declared download is missing or has an invalid file name');
      }
    }
  }
  check.ok = check.problems.length === 0;
  return check;
};

export const blueprint = (pillar: string, type: string) => `
One or two sentences on who this is for and what state their machine is in,
then a link to [the hub](/topics/${pillar}/) and two related posts.

## The first thing to check

<Steps>
  <Step title="What the reader does">
    Exactly what they click or type, and what they should see back.
  </Step>
</Steps>

## The fix itself

The working answer, with the real menu path and the real command.

${
  TESTED_TYPES.includes(type)
    ? `<WhatBroke>
  The errors actually hit while testing: what the screen said, what caused it,
  and what fixed it.
</WhatBroke>
`
    : ''
}`;
