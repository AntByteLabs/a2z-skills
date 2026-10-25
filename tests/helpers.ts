import { readFileSync, existsSync } from 'node:fs';

/**
 * The built output differs between a production build (drafts dropped) and a
 * local one with INCLUDE_DRAFTS=1, so the specs discover what exists rather
 * than hardcoding a slug that may not be there.
 */
const sitemapPaths = (): string[] => {
  const file = 'dist/sitemap-0.xml';
  if (!existsSync(file)) return [];
  const xml = readFileSync(file, 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]!).pathname);
};

const RESERVED = new Set(['/', '/topics/', '/search/', '/thanks/']);

/** A post lives at the root with a single path segment and is not a known page. */
export const firstPostPath = (): string | null => {
  const pages = new Set(
    ['about', 'editorial-policy', 'affiliate-disclosure', 'privacy', 'contact'].map(
      (p) => `/${p}/`,
    ),
  );
  return (
    sitemapPaths().find(
      (p) =>
        !RESERVED.has(p) &&
        !pages.has(p) &&
        !p.startsWith('/topics/') &&
        !p.startsWith('/authors/') &&
        p.split('/').filter(Boolean).length === 1,
    ) ?? null
  );
};

export const firstHubPath = (): string | null =>
  sitemapPaths().find((p) => p.startsWith('/topics/') && p !== '/topics/') ?? null;

export const firstAuthorPath = (): string | null =>
  sitemapPaths().find((p) => p.startsWith('/authors/')) ?? null;
