/**
 * One source of truth for everything the site repeats: brand, pillars, flags.
 * Nothing else should hardcode a URL, a pillar name or an ad decision.
 */
export const site = {
  url: 'https://a2zskillsewa.com',
  name: 'A2Z Skills',
  alternateName: 'A2Z Skills Ewa',
  tagline: 'Software and tech skills, A to Z',
  description:
    'Tested, step-by-step guides for Windows, Mac, phones, Excel, AI tools, websites and automation. Every fix is tried on a real machine before it is published.',
  locale: 'en',
  publisher: {
    name: 'Antbyte Labs',
    url: 'https://antbytelabs.com',
  },
  social: {
    youtube: '',
    x: '',
    github: 'https://github.com/AntByteLabs',
  },
  email: 'hello@a2zskillsewa.com',
  editorEmail: 'editor@a2zskillsewa.com',
  postsPerPage: 12,
  /** Ad slots render nothing until an ad network is approved. */
  ADS_ENABLED: false,
  /** Days after testing a post is considered stale. */
  RETEST_DAYS: 120,
} as const;

export const pillars = [
  'windows-mac',
  'phones',
  'excel-office',
  'ai-tools',
  'websites-hosting',
  'automation',
] as const;

export type Pillar = (typeof pillars)[number];

export const postTypes = [
  'how-to',
  'fix',
  'comparison',
  'review',
  'explainer',
  'list',
  'asset',
] as const;

export type PostType = (typeof postTypes)[number];

/** Post types where a reader is following instructions, so testing is mandatory. */
export const testedTypes: PostType[] = ['how-to', 'fix', 'review'];

/** Affiliate programmes, keyed by the slug used in post frontmatter. */
export const affiliates: Record<string, { label: string; url: string }> = {};

export const absolute = (path: string) =>
  new URL(path.startsWith('/') ? path : `/${path}`, site.url).href;
