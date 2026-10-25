/**
 * Post files are MDX with YAML frontmatter. Everything here reads and writes
 * that shape, applying the same rules the repository's validator enforces, so
 * a post created from a chat is the same as one created by hand.
 */
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { listDir, readFile, type Env } from './github';

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
  const file = await readFile(env, postPath(slug));
  if (!file) return null;
  return { slug, ...splitPost(file.text), raw: file.text };
};

/** The checks the repository validator would run, as far as one file allows. */
export const checkPost = (frontmatter: Frontmatter, body: string, slug: string) => {
  const problems: string[] = [];
  const warnings: string[] = [];
  const f = frontmatter as Record<string, any>;

  const words = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .trim()
    .split(/\s+/).length;

  if (!f.title) problems.push('title is missing');
  else if (String(f.title).length > 65)
    problems.push(`title is ${String(f.title).length} characters; the limit is 65`);

  const desc = String(f.description ?? '');
  if (!desc) problems.push('description is missing');
  else if (desc.length < 120 || desc.length > 160)
    problems.push(`description is ${desc.length} characters; it must be 120 to 160`);

  if (!PILLARS.includes(f.pillar))
    problems.push(`pillar must be one of: ${PILLARS.join(', ')}`);
  if (!TYPES.includes(f.type)) problems.push(`type must be one of: ${TYPES.join(', ')}`);
  if (!f.author) problems.push('author is missing');

  const quick = String(f.quickAnswer ?? '');
  if (!quick) problems.push('quickAnswer is missing');
  else if (quick.length > 300)
    problems.push(`quickAnswer is ${quick.length} characters; the limit is 300`);

  if (TESTED_TYPES.includes(f.type) && !f.testedOn?.date)
    problems.push(
      `a ${f.type} post must record testedOn.date, the versions and the device`,
    );

  if (
    /\bTODO\b|\bFIXME\b|\bLorem ipsum\b/i.test(body) ||
    /\bTODO\b/i.test(JSON.stringify(f))
  )
    problems.push('a TODO, FIXME or Lorem ipsum is still in the post');

  if (words < 350 && f.draft === false)
    problems.push(`${words} words of prose; under 350 is a thin page`);

  if (!new RegExp(`/topics/${f.pillar}/`).test(body))
    warnings.push(`no link back to the hub, /topics/${f.pillar}/`);

  const h2s = [...body.matchAll(/^##\s+(.+)$/gm)].length;
  if (h2s < 2) warnings.push('fewer than two H2 sections');

  if (!/^[a-z0-9-]+$/.test(slug))
    problems.push('slug must be lowercase letters, numbers and hyphens');

  return { ok: problems.length === 0, problems, warnings, words };
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
