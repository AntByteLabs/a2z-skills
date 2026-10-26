# Excel pivot table not refreshing

- **Keyword:** excel pivot table not refreshing
- **Slug:** `excel-pivot-table-not-refreshing`
- **Pillar:** excel-office · **Type:** fix · **Author:** krishna-pokharel
- **Scaffold:** `npm run new -- "excel pivot table not refreshing" --type fix --pillar excel-office --author krishna-pokharel`

## Why this one

**The hardest of the four, and the claim that was wrong.** This brief first said
no competing page uses a causes-in-order structure. That is false: ExcelDemy
publishes "Pivot Table Not Refreshing (5 Issues & Solutions)" and ranks for it,
alongside Microsoft Learn and several established Excel sites.

So the premise still holds, that a searcher who has already pressed Refresh is
lost by a page telling them to press Refresh, but the SERP is crowded with sites
that have far more authority than this one. Treat it as a later post, not an
early one, and only write it if the test turns up something those pages do not
have: a real error, a real build number, a cause they skip.

## Frontmatter to fill

```yaml
title: 'Excel pivot table not refreshing'
description: 'TODO 120 to 160 characters. Say that pressing Refresh is not the answer and name how many causes there are.'
pillar: 'excel-office'
type: 'fix'
tags: ['excel', 'pivot-tables', 'formulas']
author: 'krishna-pokharel'
quickAnswer: 'TODO. The usual cause is that the source range is fixed and the new rows fall outside it, so the pivot refreshes correctly against stale bounds. Confirm this wording against what you actually saw.'
testedOn:
  date: 'TODO'
  versions:
    Windows 11: 'TODO'
    Excel: 'TODO the build from File then Account'
  device: 'TODO'
  testedBy: 'Krishna Pokharel'
```

## Record while testing

- Excel's build number exactly as the About pane prints it.
- The source range as the Change Data Source dialog showed it, before and after.
- Whether the data was a range or a table, and what changed when you converted.
- What the pivot showed after refresh versus what the source held.
- Any message Excel gave, copied exactly.
- Whether the cached field list still offered a deleted column, and how you cleared it.
- Whether Refresh All behaved differently from Refresh.

## Structure

1. Opening: who this is for. Link [Excel & Office](/topics/excel-office/) and
   [Excel changing numbers into dates](/excel-changing-numbers-into-dates/).
2. `## Four causes, in the order that takes least time` — name them up front so
   the reader can skip.
3. `## The source range did not grow` — the most common. Needs the real dialog
   path and the exact range notation you saw.
4. `## The pivot cache is holding old fields` — explain that a pivot reads its
   own cached copy, not the sheet, and what that means for deleted columns.
5. `## The data is text where you expect numbers` — cross-link the dates
   explainer, since the cause is the same type inference.
6. `<WhatBroke>` — mandatory.

## FAQ to answer from the test

- Does converting the source to a table fix this permanently?
- Why does the field list still show a column I deleted?
- What is the difference between Refresh and Refresh All?

## Inbound links to add on publish

Add a line to `excel-changing-numbers-into-dates`, in the section on damaged
columns, pointing here for readers whose pivot is the thing reporting the problem.
