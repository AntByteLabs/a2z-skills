import { z } from 'zod';
import { pillars, postTypes, testedTypes } from '../site';

export const BANNED = [
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

const fields = z
  .object({
    title: z.string().trim().min(1).max(65),
    seoTitle: z.string().max(60).optional(),
    description: z.string().max(160),
    pillar: z.enum(pillars),
    type: z.enum(postTypes),
    author: z.string().min(1),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    quickAnswer: z.string().max(300),
    tags: z.array(z.string()).max(6).default([]),
    faq: z
      .array(z.object({ q: z.string(), a: z.string() }))
      .max(8)
      .default([]),
    affiliates: z.array(z.string()).default([]),
    downloads: z.array(z.object({ label: z.string(), file: z.string() })).default([]),
    draft: z.boolean().default(false),
    testedOn: z
      .object({
        date: z.coerce.date(),
        versions: z
          .record(z.string(), z.string())
          .refine((value) => Object.keys(value).length > 0, 'Name the tested versions'),
        device: z.string().optional(),
        testedBy: z.string().optional(),
      })
      .optional(),
    heroImage: z.string().optional(),
    heroAlt: z.string().optional(),
  })
  .superRefine((post, ctx) => {
    const issue = (path: string, message: string) =>
      ctx.addIssue({ code: 'custom', path: [path], message });
    if (!post.draft && post.description.length < 120)
      issue('description', 'Published descriptions need 120 to 160 characters');
    if (!post.draft && !post.quickAnswer.trim())
      issue('quickAnswer', 'A published post needs a short answer');
    if (!post.draft && testedTypes.includes(post.type) && !post.testedOn)
      issue('testedOn', 'A published procedure needs its test record');
    if (!post.draft && testedTypes.includes(post.type) && !post.testedOn?.testedBy?.trim())
      issue(
        'testedOn.testedBy',
        'A published procedure needs the name of the person who tested it',
      );
    if (post.heroImage && !post.heroAlt?.trim())
      issue('heroAlt', 'The hero image needs alt text');
    if (post.updatedAt && post.updatedAt < post.publishedAt)
      issue('updatedAt', 'Updated date precedes publication');
    if (
      post.testedOn &&
      post.testedOn.date.getTime() >
        Math.max(post.publishedAt.getTime(), post.updatedAt?.getTime() ?? 0) + 86_400_000
    )
      issue('testedOn', 'Test date follows publication/update');
  });

export const internalPaths = (body: string) => [
  ...[...body.matchAll(/\]\((\/[^)\s]*)\)/g)].map((match) => match[1]!),
  ...[...body.matchAll(/href=["'](\/[^"']*)["']/g)].map((match) => match[1]!),
];
export const proseText = (body: string) =>
  body
    .replace(/\x60\x60\x60[\s\S]*?\x60\x60\x60/g, ' ')
    .replace(/\x60[^\x60]*\x60/g, ' ')
    .replace(/<[^>]+>/g, ' ');

export type ContentContext = {
  authors: Set<string>;
  knownPaths: Set<string>;
  publishedSlugs: Set<string>;
  draftSlugs: Set<string>;
  redirects: string;
};

export const checkArticle = (
  frontmatter: Record<string, unknown>,
  body: string,
  slug: string,
  context?: ContentContext,
) => {
  const problems: string[] = [];
  const warnings: string[] = [];
  const result = fields.safeParse(frontmatter);
  if (!result.success)
    problems.push(
      ...result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
    );
  const text = proseText(body);
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const draft = frontmatter.draft === true;
  const links = internalPaths(body);
  const clean = (path: string) => path.split(/[?#]/)[0]!;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || /(^|-)(19|20)\d{2}(-|$)/.test(slug))
    problems.push('Use a lowercase hyphenated slug without a year');
  if (/\bTODO\b|\bFIXME\b|\bLorem ipsum\b/i.test(body + JSON.stringify(frontmatter)))
    problems.push('Remove the remaining placeholder');
  for (const phrase of BANNED)
    if (text.toLowerCase().includes(phrase)) problems.push(`Banned phrase: "${phrase}"`);
  const headings = [...body.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1]!.trim());
  if (new Set(headings).size !== headings.length)
    problems.push('Two H2 headings have the same text');
  if (!draft) {
    if (words < 350) problems.push(`${words} words of prose; the editorial minimum is 350`);
    if (!links.some((link) => clean(link) === `/topics/${frontmatter.pillar}/`))
      problems.push('Link to the topic hub');
    if (
      typeof frontmatter.type === 'string' &&
      testedTypes.includes(frontmatter.type as (typeof postTypes)[number]) &&
      !/<WhatBroke[\s>]/.test(body)
    )
      problems.push('A tested procedure needs its WhatBroke section');
  }
  if (headings.length < 2) warnings.push('Fewer than two H2 sections');
  if (context) {
    if (!context.authors.has(String(frontmatter.author))) problems.push('Unknown author');
    for (const link of links) {
      const path = clean(link);
      if (path.startsWith('/go/') || path.startsWith('/downloads/')) continue;
      if (!context.knownPaths.has(path)) problems.push(`No page exists at ${path}`);
      if (!draft && context.draftSlugs.has(path.replace(/^\/|\/$/g, '')))
        problems.push(`Published post links to draft ${path}`);
    }
    const related = new Set(
      links
        .map(clean)
        .map((path) => path.replace(/^\/|\/$/g, ''))
        .filter((id) => id !== slug && context.publishedSlugs.has(id)),
    );
    if (!draft && context.publishedSlugs.size >= 4 && related.size < 2)
      problems.push('Link to at least two other published posts');
    for (const match of body.matchAll(/\/go\/([a-z0-9-]+)\//g)) {
      const affiliate = match[1]!;
      if (
        !Array.isArray(frontmatter.affiliates) ||
        !frontmatter.affiliates.includes(affiliate)
      )
        problems.push(`Declare affiliate ${affiliate}`);
      if (
        !context.redirects
          .split('\n')
          .some(
            (line) =>
              line.trim().split(/\s+/)[0]?.replace(/\/$/, '') === `/go/${affiliate}`,
          )
      )
        problems.push(`Missing affiliate redirect for ${affiliate}`);
    }
  }
  return { ok: problems.length === 0, problems: [...new Set(problems)], warnings, words };
};
