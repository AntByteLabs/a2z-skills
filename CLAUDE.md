# A2Z Skills — house rules

Static Astro site on `a2zskillsewa.com`, served from Cloudflare Workers static
assets. Everything runs on a free tier. Read this before writing anything into
the repo.

## The one rule

**A person tests every procedure before it is published.** You may draft, edit,
scaffold, check and open pull requests. You may not invent a step, a version
number, an error message, a price or a menu path. If a fact is missing, ask for
it — never fill the gap.

## Commands

| Command                           | What it does                                            |
| --------------------------------- | ------------------------------------------------------- |
| `npm run new -- "the keyword"`    | Scaffolds a post folder, slug and blueprint             |
| `npm run validate`                | The quality gate. Must pass before a PR                 |
| `npm run build`                   | `astro check` → build → Pagefind → asset count → budget |
| `npm run links`                   | Broken internal links in `dist/`                        |
| `npm test`                        | Playwright smoke tests against `dist/`                  |
| `npm run suggest-links -- <slug>` | Older posts that should link to a new one               |
| `npm run stale`                   | Posts past their re-test date                           |
| `npm run icons`                   | Re-renders the PNG icons from `public/favicon.svg`      |
| `npm run lhci`                    | Lighthouse budgets (needs `CHROME_PATH` locally)        |
| `npm run check`                   | **All gates in one go. Nothing ships without it**       |
| `npm run deploy`                  | `check`, then `wrangler deploy`                         |

Build with `INCLUDE_DRAFTS=1 npm run build` to render drafts locally. Production
builds drop them.

## Voice

Write the way one competent person explains something to another who is stuck.

- Short sentences. One idea each. Plain words.
- Say what happened, not how significant it was.
- No second-person hype ("unlock", "supercharge", "effortlessly").
- British spelling.
- Name the thing: "click **File → Account**", not "navigate to the account area".
- Numbers and versions exactly as the screen shows them.
- Opinions are welcome and must be the writer's own, from the test.

**Before any prose is committed, run `/humanizer` on it.** `validate` warns on
the patterns it exists to remove; the skill does the rewriting. `validate` fails
outright on the banned filler phrases listed in `scripts/validate-content.ts`.

## The post blueprint

Every post is assembled in this order. The template renders most of it from
frontmatter, so the fields are not optional decoration.

1. Breadcrumbs, H1, author byline, published and updated dates
2. `quickAnswer` — the answer in two or three sentences, quotable on its own
3. `testedOn` — versions, device, date, tester
4. Affiliate disclosure, automatically, when `affiliates` is set
5. Table of contents, from the H2s
6. Body: `Steps`/`Step`, `Callout`, `ComparisonTable`, `ToolCard`
7. `WhatBroke` — the real errors hit during testing. This is the section
   competitors do not have. Never skip it on a tested post.
8. Downloads, FAQ, author box, newsletter, related posts

Components are passed in by the route, so a post body uses them without an
import.

## Frontmatter

Full schema in `src/content.config.ts`. It is enforced at build time; a post
that breaks it fails the build rather than publishing thin.

- `description` — 120 to 160 characters, exactly
- `title` — 65 characters or fewer; add `seoTitle` (60 max) only to override
- `type` — `how-to` | `fix` | `comparison` | `review` | `explainer` | `list` | `asset`
- `testedOn` — **required** for `how-to`, `fix` and `review`
- **Always double-quote strings.** YAML reads `#` as a comment and breaks on
  `: `, which silently truncates a description to nothing.

## Slugs

Lowercase, hyphens, 3 to 6 words, main keyword first, no years, no stop words.
`excel-xlookup-not-working`, never `how-to-fix-xlookup-in-excel-2026`.

Changing a published slug requires a line in `public/_redirects` **in the same
pull request**. `validate` compares against the last commit and fails without it.

## Linking

- Every post links to its hub (`/topics/<pillar>/`) and to at least two other posts.
- A new post gets two or three links added from older posts in the same pillar,
  the same day. `npm run suggest-links -- <slug>` finds the sentences.
- Affiliate links go through `/go/<slug>/`, carry `rel="sponsored nofollow"`,
  and need a line in `_redirects` plus the slug in `affiliates`.

## Design

Design changes go through the installed skills, not by hand:

- `/hallmark` for a new page or section, `/hallmark audit <path>` to check one.
- `/impeccable critique`, `/impeccable polish`, `/impeccable audit` for review
  passes on existing templates.
- Colours, type and spacing live in `@theme` in `src/styles/global.css`. Use the
  generated utilities (`text-ink`, `bg-paper`, `border-rule`), never raw hex.
- Buttons use `bg-brand-deep text-paper`: `bg-brand` with white text fails WCAG
  contrast, and that pairing flips correctly in dark mode.
- Never add a web font. One display face is self-hosted and preloaded; body text
  is the system stack.

## There is no CI

GitHub Actions was removed from this project: it needed a Cloudflare token it
did not have, and the failure emails were worse than useless. Every gate now
runs locally, and a `pre-push` hook runs them for you:

```bash
git config core.hooksPath .githooks   # once per clone
npm run check                         # lint, worker types, validate, build, links, tests
npm run deploy                        # check, then wrangler deploy
```

Nothing stops you pushing with `--no-verify`. If you do that and the site
breaks, that is the trade you made.

GitHub Actions is disabled on the repository, so nothing there runs. A hero
image is added locally:

```bash
npm run image -- <slug> "https://…/image.png" "What the image shows"
```

That fetches it over https only, checks it really is an image, re-encodes it to
WebP at 1600px, strips metadata and sets `heroImage` and `heroAlt`.

## Performance budget

Lighthouse mobile must stay at 95+ (it is currently 100), LCP
under 2.0 s, CLS under 0.05, JS under 30 KB and CSS under 25 KB per page,
measured gzipped by `scripts/check-budget.ts`.

Islands are limited to the table of contents, theme toggle, newsletter form and
search. Anything else ships as HTML. Images go through Astro's pipeline with
explicit dimensions.

## Money

- `site.ADS_ENABLED` is `false`. Ad slots render nothing until a network is
  approved. Do not switch it on.
- No ads on comparison or review pages: affiliate links earn more there.
- Never fabricate a rating, a price or a discount code.

## Spam, secrets and backups

The subscribe endpoint has two defences. The honeypot always runs. Turnstile
runs **only when the Worker secret `TURNSTILE_SECRET` is set**, and it is not
set, so today the honeypot is the only check.

```bash
npx wrangler secret put TURNSTILE_SECRET     # turn enforcement on
npx wrangler secret delete TURNSTILE_SECRET  # turn it straight back off
```

Two things to know before you run the first one:

- **A visitor with JavaScript off can no longer subscribe.** Turnstile needs
  JavaScript to produce a token, and the Worker will reject a submission
  without one. Everything else on the site still works without JavaScript.
- **Nobody has watched a real token being issued.** Turnstile refuses to issue
  one to an automated browser, which is the point of it, so the path cannot be
  tested from a script. Subscribe once yourself, in a real browser, straight
  after setting the secret. If it fails, delete the secret and you are back to
  where you were.

The site key is public and lives in `src/site.ts`. The secret belongs in the
Worker and nowhere else: not in the repo, not in a workflow file, not in chat.

Back up before you touch anything that writes to D1:

```bash
npm run backup   # exports to ~/a2z-skills-backups, keeps the last 14
```

D1 Time Travel already covers a bad migration for 30 days. The export covers
the thing it cannot: losing access to the Cloudflare account. The subscriber
list is the only data here that cannot be rebuilt from this repo.

## What not to touch

- `wrangler.json` routes and the D1 binding, without being asked.
- `public/_headers` cache rules — they are what keeps repeat visits fast.
- `site.ts` flags.
- `.githooks/pre-push` — it is the only gate left before the live site.

## Publishing

1. Brief: open a post-brief issue.
2. `npm run new -- "<keyword>"` on a branch named `post/<slug>`.
3. A person tests it and records versions, device, date and every error.
4. Draft into `index.mdx`, then `/humanizer`.
5. A person edits: cut filler, verify every step, write `WhatBroke`.
6. `npm run check`.
7. Read the page once on a phone, with `npm run preview`.
8. Merge, then `npm run deploy`.
9. Add the two or three inbound links the same day.
