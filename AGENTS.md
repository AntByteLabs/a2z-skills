# AGENTS.md

Read [CLAUDE.md](CLAUDE.md) first. It is the single source of truth for this
project: the testing rule, voice, frontmatter, slugs, linking, design, the
performance budget and the money flags. Nothing is duplicated here, because two
copies of a rule become two different rules.

This file exists for one thing CLAUDE.md does not cover: **more than one agent
works in this repository at the same time.**

## The three rules that matter most

They are in CLAUDE.md in full. They are repeated as a pointer because breaking
one is expensive and easy:

1. **A person tests every procedure before it is published.** Never invent a
   step, a version number, an error message, a price or a menu path. A missing
   fact is a question for the user, not a gap to fill.
2. **`npm run check` must pass before you push.** Lint, worker types, content
   validation, build, link check and the Playwright suite. A `pre-push` hook
   runs it for you.
3. **Do not switch on `site.ADS_ENABLED`, change `wrangler.json` routes or the
   D1 binding, or edit `public/_headers` cache rules** without being asked.

## Working alongside another agent

`main` deploys to production on push. Two agents pushing to it is how a
half-finished change reaches readers.

- **Work on a branch.** `git worktree add ../a2z-skills-<topic> -b <topic>`
  keeps your checkout separate. Merge to `main` deliberately, once your work is
  green.
- **Never use bare `git stash` or `git stash pop`.** The stash stack is shared
  across worktrees, so a pop can take another agent's changes. Set work aside
  with a WIP commit instead. If you must stash:
  `git stash push -u -m "<unique-tag>"`, note the SHA, restore with
  `git stash apply <sha>`.
- **Before you start, check who else is mid-flight:** `git worktree list`, then
  `git -C <path> status --porcelain`. A tree with uncommitted changes belongs to
  somebody.
- **Do not rewrite another agent's prose to taste.** Correcting a fact is
  welcome. Hedging a plain sentence is not: see the voice rules in CLAUDE.md,
  which exist because qualified prose reads as evasive and ranks no better.
- **Do not revert another agent's commit.** Say what looks wrong and let the
  user decide.
- **If you change an article's internal links, keep its hub link and its two
  outbound links.** `npm run validate` enforces the count; it cannot tell you
  that you have broken a deliberate cluster.

## What each tool is for

Not a rule, just what has worked: one agent on content and SEO, one on the
platform and templates, and whoever touches `src/content/posts/` last runs
`/humanizer` on the prose before committing it.
