# SEO implementation status

Date: 26 October 2026. Branch: seo/research-plan-20261026.

## Implemented

- [x] Search initialises correctly, preserves the query and returns relevant guides.
- [x] Pagefind indexes the 12 articles instead of utility pages and navigation.
- [x] The real build command validates content before Astro runs.
- [x] MCP create, update and publish paths check content before committing.
- [x] Generic MCP file writes cannot bypass the article checks.
- [x] Incomplete draft metadata stays unpublished; published procedures need test records.
- [x] The link checker serves and crawls every built HTML page.
- [x] Sitemaps exclude noindex posts and use meaningful aggregate modification dates.
- [x] Utility noindex can be read by crawlers.
- [x] Sparse tag archives have an explicit noindex policy.
- [x] Homepage titles avoid repeating the brand.
- [x] Obsolete SearchAction expectations were removed; FAQ markup makes no rich-result promise.
- [x] IndexNow verification is generated before building, with a stable public fallback key.
- [x] An optional production-only Web Analytics beacon is prepared for a valid public token.
- [x] All 12 published articles have primary documentation or research references.
- [x] Excel conversion, photo retention, storage and AI-detector overclaims were corrected.
- [x] The n8n and Cloudflare entry guides have scope and diagnostic sections based on their existing test records.
- [x] All six topic hubs have relevant starting articles and accurate descriptions.
- [x] Home, About and article labels distinguish tested procedures from researched explainers.
- [x] Weak cross-topic links were replaced where relevant existing articles were available.
- [x] README and MCP publishing documentation reflect the current checks.
- [x] Eight new keyword briefs are prepared with human-test requirements and overlap boundaries.

## Validation

The full local check passed: lint/formatting, Worker types, content validation,
Astro build/check, asset/transfer budgets, internal links and browser tests.
There were 92 passing browser tests and two intentionally skipped desktop
touch-target tests. Seven focused tests cover publication checks, valid edits,
directory-index links and modification dates.

Nine Lighthouse runs across the home page, an article and a topic hub each
scored 100 for performance, accessibility, best practices and SEO. Lab LCP was
about 1.35 seconds, with CLS 0. These are lab measurements, not field results.

The MCP bundle passed a Wrangler dry run. External source-link checks reviewed
28 URLs; URLs blocked to the command-line client were also researched through
the web tool. Five existing author-photo/profile warnings remain factual.

## Account access and human evidence still needed

- [ ] Supply the public Cloudflare Web Analytics beacon token and verify a single live beacon request.
- [ ] Record the actual Search Console clicks, impressions, indexed pages and selected canonicals.
- [ ] Obtain the real test records for the new procedures before publishing them.
- [ ] Add public profiles and permissioned photographs when the authors provide them.
- [ ] Review performance and query data over time; the new site has no historical dataset in this session.

The Cloudflare app connection targets another account. The existing CLI login
can deploy the project, but its Web Analytics API request received HTTP 403.
No analytics token or traffic count was invented.

The new guides remain briefs under [briefs](briefs/). The existing XLOOKUP and
automation comparison fixtures also remain drafts. The house rule states,
“A person tests every procedure before it is published.”
See [CLAUDE.md](../../CLAUDE.md).

## Deployment

Prepared for publication after integrating the latest reader-feature commit.
Deployment and live-check results will be recorded after they run.
