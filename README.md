# A2Z Skills

[A2Z Skills](https://a2zskillsewa.com) publishes tested fixes and sourced
explanations about software, automation, hosting and everyday tech problems.
Astro produces static pages served by a Cloudflare Worker. The Worker also
handles newsletter sign-ups and article feedback through D1.

Read [CLAUDE.md](CLAUDE.md) before changing the project.

## Development and checks

Use the Node version required by package.json, then:

```sh
npm ci
git config core.hooksPath .githooks
npm run dev
```

Production pages exclude drafts. INCLUDE_DRAFTS=1 npm run build includes them
for a local preview.

```sh
npm run check
```

The full check runs lint/formatting, Worker types, focused regression tests,
content validation, the Astro build, Pagefind, asset/transfer budgets, a crawl
of every built HTML page, and mobile/desktop browser tests. Browser tests use the local Worker so production headers, including CSP,
are exercised. Form submissions in those tests are mocked.

npm run build includes content validation itself. Cloudflare Workers Builds
watches main and uses that command, so GitHub API commits pass through the
validator even when they do not use a local pre-push hook. GitHub Actions is
not the site's deployment system.

The MCP server validates an article and its repository references before
create, update and publish writes. Generic file writes cannot bypass the
article tools.

## Publishing

A person must test every published procedure and supply its actual versions,
date and results. Research explainers link to their sources and are labelled
separately. Never add an invented testedOn record.

```sh
npm run new -- "the keyword"
npm run validate
npm run check
npm run deploy
```

The local deploy command runs the checks before uploading the existing Worker
and static assets. It does not change DNS routes or apply D1 migrations.

A new post needs contextual links from its topic hub and relevant existing
articles. Keep published URLs stable; add a redirect when retiring one.

## Build variables

.env.example lists optional build variables. Production values belong in
Cloudflare Workers Builds, and Worker secrets are configured separately.
Do not commit private credentials.

INDEXNOW_KEY is public verification material. A stable public key is stored in
public/indexnow-key.txt; the environment variable can override it. Prebuild writes
its verification file before Astro copies public assets. If no key is available, IndexNow is skipped without breaking deployment. IndexNow does not
request Google indexing.

PUBLIC_CF_WEB_ANALYTICS_TOKEN is the public beacon token for this site's
Cloudflare Web Analytics setup. A valid configured token enables one deferred
script in production. Choose manual installation or Cloudflare automatic
injection, and verify that the beacon is installed once. No token is configured
by default in source.

The verified Search Console property, private traffic data and Google's
selected canonical are separate from public HTTP checks. See
[measurement](docs/seo/MEASUREMENT.md).

## Search and indexing

Pagefind indexes published article content. The search page preserves q in
the URL and loads the generated UI when used.

The sitemap includes canonical indexable posts, topic hubs, authors and
standalone pages. Its dates use meaningful content updates, including revisions
to older articles. Utility pages and sparse tag archives use noindex and remain
crawlable so that rule can be read. The topic hubs are the primary discovery
path.

The site describes articles, authors and breadcrumbs with JSON-LD. No FAQ rich
result, sitelinks search box or llms.txt ranking benefit is promised.

## Operations

Keep the Worker routes, D1 binding, cache rules and ad flags within the existing
project rules. The site remains on free services.

Before any change that writes to D1, follow the backup instructions in
CLAUDE.md. Existing database migrations and the subscriber data are outside
routine SEO deployments.

The separate MCP Worker is documented in [mcp/README.md](mcp/README.md).
n8n operations are documented under ops/n8n. Any task involving the Oracle
free server must run its required rules and oracle-guard command first.
The production VPS is not a testing environment.

## SEO work

- [Research plan](docs/seo/SEO-PLAN-2026-10-26.md)
- [Keyword map](docs/seo/keyword-map-2026-10-26.csv)
- [Implementation status](docs/seo/IMPLEMENTATION-STATUS-2026-10-26.md)
- [Unpublished human-test briefs](docs/seo/briefs/)
