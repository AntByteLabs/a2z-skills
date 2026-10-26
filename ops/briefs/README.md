# Post briefs awaiting a test

Four posts are drafted here rather than in `src/content/posts/`. Each is a
`fix` post, so `content.config.ts` requires `testedOn` and the build refuses it
without one. They sit outside the content collection on purpose: a `TODO` in a
post file fails `npm run validate`, and that would block every push.

Each brief holds everything that does not come from a machine: the keyword, the
slug, the frontmatter, the structure, the FAQ questions and the internal links.
What it does not hold is anything a person has to see with their own eyes.

## How to finish one

1. Run the test. Record every item under **Record while testing** in the brief,
   including the errors. The errors are the `WhatBroke` section, which is the
   part competitors do not have.
2. `npm run new -- "<keyword>" --type fix --pillar <pillar> --author <author>`
3. Paste the brief's frontmatter and body in, then fill the blanks from your
   notes. Never fill one from memory: if the version is not written down, test
   it again.
4. `/humanizer` on the prose.
5. `npm run suggest-links -- <slug>`, then add the inbound links it finds.
6. `npm run check`, set `draft: false`, push.

## What was not done

**No keyword research.** These ten topics were chosen on judgement about search
intent, not from volume or difficulty data. Ahrefs is connected to this account
but every endpoint returns "Insufficient plan", including the free domain
rating, so none of it could be measured here.

That matters most for the Excel pivot brief, where a claim about competitors
turned out to be plainly wrong when the SERP was finally read. The "Why this
one" section of each brief now says whether its reasoning was checked.

Before committing a day to any of these, do the cheap version of the research:

1. Search the exact phrase and read the first page. Established sites with real
   authority on every result means pick something else.
2. Check Search Console once impressions start. Real queries from the live site
   beat any guess in this folder, and they arrive free.
3. If a keyword tool becomes available, check volume before writing, not after.

## The four

| Slug                               | Pillar       | Tester     | Needs                                     |
| ---------------------------------- | ------------ | ---------- | ----------------------------------------- |
| `windows-update-stuck-downloading` | windows-mac  | Devchandra | A Windows machine with a stalled update   |
| `icloud-backup-stuck-estimating`   | phones       | Krishna    | An iPhone, ideally one that has done this |
| `excel-pivot-table-not-refreshing` | excel-office | Krishna    | Excel and a workbook with a pivot         |
| `n8n-webhook-not-triggering`       | automation   | Ronit      | The n8n instance already running          |
