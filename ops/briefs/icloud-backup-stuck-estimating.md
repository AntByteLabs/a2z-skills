# iCloud backup stuck on estimating time remaining

- **Keyword:** icloud backup stuck estimating time remaining
- **Slug:** `icloud-backup-stuck-estimating`
- **Pillar:** phones · **Type:** fix · **Author:** krishna-pokharel
- **Scaffold:** `npm run new -- "icloud backup stuck estimating time remaining" --type fix --pillar phones --author krishna-pokharel`

## Why this one

People hit this at the worst moment, part way through setting up a replacement
handset. The competing pages are thin and mostly recommend restarting, which is
the one thing that can cost the reader the backup they were waiting for.

## Frontmatter to fill

```yaml
title: 'iCloud backup stuck on estimating time remaining'
description: 'TODO 120 to 160 characters. Lead with how long is genuinely normal, because that is the question underneath the search.'
pillar: 'phones'
type: 'fix'
tags: ['iphone', 'icloud', 'backup']
author: 'krishna-pokharel'
quickAnswer: 'TODO. Say what estimating actually means, how long it is reasonable to wait before acting, and what not to do while waiting.'
testedOn:
  date: 'TODO'
  versions:
    iOS: 'TODO the exact version'
  device: 'TODO the handset model'
  testedBy: 'Krishna Pokharel'
```

## Record while testing

- iOS version exactly as Settings reports it, and the handset model.
- How long the estimating state lasted before anything changed.
- The iCloud storage figure: used, total, and what the backup was estimated at.
- Whether the phone was on Wi-Fi, locked, and on power, and what changed when each was altered.
- The exact wording of any message, including whether it said the backup could not be completed.
- Whether an older backup existed and whether it survived.
- What finally moved it, and how long that took.

## Structure

1. Opening: who this is for, and the reassurance that the backup is usually not
   lost. Link [Phones](/topics/phones/) and
   [phone storage full after deleting photos](/phone-storage-full-after-deleting-photos/).
2. `## What estimating actually means` — the phone is indexing what to send, not
   sending it. Explain why a large photo library makes this slow and silent.
3. `## How long is normal` — needs your measured figure. This is the section the
   page will rank on, and nobody else gives a number.
4. `## What not to do while you wait` — a `Callout type="danger"`. Interrupting
   mid-backup is the move that actually costs data.
5. `## When it is genuinely stuck` — the real recovery, in `Steps`.
6. `<WhatBroke>` — mandatory.

## FAQ to answer from the test

- Will I lose my previous backup if this one fails?
- Does the phone need to stay unlocked for the backup to continue?
- Why does the estimate go up rather than down?
