/**
 * Budgets from the build plan. URLs are discovered from the built sitemap so
 * the same config works on a production build and on one with drafts.
 */
const { readFileSync, existsSync } = require('node:fs');

const paths = () => {
  if (!existsSync('dist/sitemap-0.xml')) return [];
  const xml = readFileSync('dist/sitemap-0.xml', 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
};

const all = paths();
const pages = new Set(
  ['about', 'editorial-policy', 'affiliate-disclosure', 'privacy', 'contact'].map(
    (p) => `/${p}/`,
  ),
);
const isPost = (p) =>
  p !== '/' &&
  !pages.has(p) &&
  !p.startsWith('/topics/') &&
  !p.startsWith('/authors/') &&
  p.split('/').filter(Boolean).length === 1;

/** A draft or otherwise noindexed page would fail the SEO assertion by design. */
const indexable = (p) => {
  const file = `dist${p}index.html`;
  if (!existsSync(file)) return false;
  return !/name="robots"[^>]*content="[^"]*noindex/.test(readFileSync(file, 'utf8'));
};

const toFile = (p) => `http://localhost${p}index.html`;
const post = all.filter(isPost).find(indexable);
const hub = all.filter((p) => p.startsWith('/topics/') && p !== '/topics/').find(indexable);

const urls = [
  'http://localhost/index.html',
  post && toFile(post),
  hub && toFile(hub),
].filter(Boolean);

module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      url: urls,
      numberOfRuns: 3,
      settings: { formFactor: 'mobile', screenEmulation: { mobile: true } },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.95 }],
        'categories:accessibility': ['error', { minScore: 1 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 1 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.05 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
      },
    },
    upload: { target: 'temporary-public-storage' },
  },
};
