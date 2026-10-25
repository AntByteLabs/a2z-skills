# A2Z Skills

Static Astro site for [a2zskillsewa.com](https://a2zskillsewa.com) — tested tech
guides for Windows, Mac, phones, Excel, AI tools, websites and automation.
Served from Cloudflare Workers static assets, built and deployed by GitHub
Actions, on free tiers throughout.

House rules for anyone (or anything) writing in this repo: **[CLAUDE.md](./CLAUDE.md)**.

## Stack

| Layer           | Choice                                                     | Version        |
| --------------- | ---------------------------------------------------------- | -------------- |
| Site            | Astro, static output                                       | 7.4.2          |
| Content         | MDX content collections, zod schemas                       | 8.1.1 / 4.6.7  |
| Styling         | Tailwind CSS v4 via `@tailwindcss/vite`, typography plugin | 4.3.3          |
| Search          | Pagefind, built after the site                             | 1.5.2          |
| Social images   | satori + resvg, one per post at build                      | 0.63.2 / 2.6.2 |
| Structured data | schema-dts, typed JSON-LD                                  | 2.1.0          |
| Hosting         | Cloudflare Workers static assets via wrangler              | 4.152.0        |
| Newsletter      | One Worker route + Cloudflare D1                           | —              |
| CI              | GitHub Actions, Lighthouse CI, Playwright, linkinator      | —              |
| Runtime         | Node                                                       | ≥ 22.23.4      |

## Local setup

```bash
npm ci
npm run dev            # http://localhost:4321, drafts visible
npm run build          # check → build → Pagefind → asset count → budget
INCLUDE_DRAFTS=1 npm run build   # include drafts in the build
npm test               # Playwright smoke tests against dist/
```

Lighthouse locally needs a Chrome path:

```bash
npx playwright install chromium
export CHROME_PATH="$HOME/Library/Caches/ms-playwright/chromium-*/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"
npm run lhci
```

## Writing a post

```bash
npm run new -- "excel xlookup not working" --type fix --pillar excel-office
# test it for real, fill the TODOs, then:
npm run image -- excel-xlookup-not-working "https://…/hero.png" "What the image shows"
npm run suggest-links -- excel-xlookup-not-working
npm run validate && npm run build && npm test
```

`validate` is the gate. It fails on missing test records, thin prose, a post with
no hub link or fewer than two internal links, an affiliate link without a
disclosure or a redirect, a renamed slug with no redirect, banned filler, and any
leftover `TODO`.

## Cloudflare setup, once

Nothing below has been done yet. Each step is safe to stop after.

1. **Move DNS to Cloudflare.** Workers custom domains only work on Cloudflare
   nameservers. Add `a2zskillsewa.com` as a zone, then change the nameservers at
   the registrar. Free.
2. **Create the D1 database** and put the id in `wrangler.json`:
   ```bash
   npx wrangler d1 create a2z-skills
   npx wrangler d1 migrations apply a2z-skills --remote
   ```
   The deploy workflow refuses to run while the placeholder id is still there.
3. **Turnstile**: create a widget, set `PUBLIC_TURNSTILE_SITE_KEY` as an Actions
   secret and the secret key as a Worker secret:
   ```bash
   npx wrangler secret put TURNSTILE_SECRET
   ```
   Without it the form still works, protected only by the honeypot.
4. **Deploy**: `npx wrangler deploy`. The custom domain route in `wrangler.json`
   attaches `a2zskillsewa.com` once the zone is on Cloudflare.
5. **Redirect `www`** to the apex with a free Redirect Rule in the dashboard.
   Workers custom domains cannot do it, and it is not a `_redirects` line.
6. **Email routing**: forward `hello@` and `editor@` to a real inbox. Free.
7. **Verify** Search Console (domain property, DNS record), Bing Webmaster
   Tools, Ahrefs Webmaster Tools. Submit `/sitemap-index.xml`.
8. **Turn on Cloudflare Web Analytics** for the zone.

### GitHub Actions secrets

| Secret                      | Used for                                                           |
| --------------------------- | ------------------------------------------------------------------ |
| `CLOUDFLARE_API_TOKEN`      | Scoped to Workers Scripts edit + D1 edit on this account           |
| `CLOUDFLARE_ACCOUNT_ID`     | Deploy target                                                      |
| `INDEXNOW_KEY`              | 32 hex chars (`openssl rand -hex 16`); also served at `/<key>.txt` |
| `PUBLIC_TURNSTILE_SITE_KEY` | Baked into the build, public by design                             |
| `LHCI_GITHUB_APP_TOKEN`     | Optional, for Lighthouse status checks                             |

## What runs when

| Trigger          | What happens                                                                                                                        |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Pull request     | lint, worker typecheck, validate, build, link check, Lighthouse budgets, Playwright, design gates (advisory), preview URL commented |
| Merge to `main`  | validate, IndexNow key file, build, D1 migrations, `wrangler deploy`, IndexNow ping with the changed URLs                           |
| Monday 06:00 UTC | `stale-posts.ts` opens one issue listing posts past their re-test date                                                              |
| Weekly           | Dependabot, grouped by Astro and tooling                                                                                            |

## Free-tier ceilings

Static requests are free and unlimited. The first wall is **20,000 files per
deploy** (`count-assets.ts` warns at 16,000 and fails at 19,500), not traffic.
D1 gives 5 million reads and 100,000 writes a day; a sign-up is one write.
Sending email to arbitrary recipients needs Workers Paid, which is why addresses
are collected now and mailed from a newsletter tool later.

## Repo layout

```
src/
  components/   seo · post · money · site · cards
  content/      posts · pillars · authors · pages
  layouts/      BaseLayout · PostLayout
  lib/          schema (JSON-LD) · posts · og · format
  pages/        routes, including og/ and llms.txt
  styles/       global.css — all design tokens live here
  site.ts       brand, pillars, ADS_ENABLED
scripts/        new-post · validate-content · internal-links · stale-posts
                count-assets · check-budget · indexnow · add-image · make-icons
worker/         the one Worker: /api/subscribe, /api/confirm, D1 migrations
public/         _headers · _redirects · robots.txt · fonts · downloads
```
