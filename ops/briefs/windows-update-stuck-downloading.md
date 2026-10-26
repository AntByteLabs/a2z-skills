# Windows update stuck downloading

- **Keyword:** windows update stuck downloading
- **Slug:** `windows-update-stuck-downloading`
- **Pillar:** windows-mac · **Type:** fix · **Author:** devchandra-shrestha
- **Scaffold:** `npm run new -- "windows update stuck downloading" --type fix --pillar windows-mac --author devchandra-shrestha`

## Why this one

Highest-volume desktop failure that produces no error message, so the searcher
has nothing to type except the symptom. Every competing page opens with the same
four generic steps and none of them says what the percentage figure means or why
it lies. That is the gap.

## Frontmatter to fill

```yaml
title: 'Windows update stuck downloading'
description: 'TODO 120 to 160 characters. Lead with the percentage that never moves, then promise the order to check things in.'
pillar: 'windows-mac'
type: 'fix'
tags: ['windows', 'windows-update', 'troubleshooting']
author: 'devchandra-shrestha'
quickAnswer: 'TODO. Say what a stalled percentage actually means, name the single most likely cause from the test, and give the one action that resolved it.'
testedOn:
  date: 'TODO the date you tested'
  versions:
    Windows 11: 'TODO the build, from winver'
  device: 'TODO the machine'
  testedBy: 'Devchandra Shrestha'
```

## Record while testing

- The exact build number from `winver`, as shown.
- The update's KB number and what the pane said beside it.
- Whether the percentage was frozen or moving slowly, and for how long.
- The size of `C:\Windows\SoftwareDistribution\Download` before and after.
- Every error code shown, copied exactly, including the leading `0x`.
- Whether a restart alone resolved it, and if so at which point.
- Free space on the system drive before you started.
- How long the whole thing took, end to end.

## Structure

1. Opening: two sentences on who this is for. Link
   [Windows & Mac](/topics/windows-mac/),
   [deleting files did not free any disk space](/deleting-files-not-freeing-disk-space/)
   for the disk-space cause, and
   [why automations fail silently](/automations-failing-silently/) only if the
   silent-failure framing earns its place.
2. `## What a stuck percentage actually means` — the figure reports the last
   checkpoint, not live progress, so a frozen number and a working download look
   identical. Explain the distinction before offering any fix.
3. `## Check it is actually stuck` — the test that separates slow from stalled.
   Needs the real counter you used and what it showed.
4. `## Clear the download cache` — `Steps`, one action per step, with the real
   service names and the real paths as they appeared.
5. `## When the cause is disk space` — short, and link the storage explainer.
6. `<WhatBroke>` — the errors you actually hit. Mandatory.

## FAQ to answer from the test

- How long should I wait before deciding an update is stuck?
- Is it safe to delete the contents of the SoftwareDistribution folder?
- Why does the same update fail again after it restarts?

## Inbound links to add on publish

Run `npm run suggest-links -- windows-update-stuck-downloading`. At minimum, add
a line to `deleting-files-not-freeing-disk-space` pointing here from the section
about disks at zero bytes.
