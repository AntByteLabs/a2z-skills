# n8n webhook not triggering

- **Keyword:** n8n webhook not triggering
- **Slug:** `n8n-webhook-not-triggering`
- **Pillar:** automation · **Type:** fix · **Author:** ronit-karki
- **Scaffold:** `npm run new -- "n8n webhook not triggering" --type fix --pillar automation --author ronit-karki`

## Why this one

**The one to do first**, and the only one of the four whose premise rests on
something we have actually seen. We run the instance, so the test costs an hour
rather than a day, and the test URL versus production URL split is a real trap
we hit ourselves.

Search demand has not been measured. n8n is a smaller audience than Excel or
Windows, so expect less traffic and less competition at the same time.

## Frontmatter to fill

```yaml
title: 'n8n webhook not triggering'
description: 'TODO 120 to 160 characters. Lead with the test URL and production URL split, because that is most of the cases.'
pillar: 'automation'
type: 'fix'
tags: ['n8n', 'webhooks', 'automation']
author: 'ronit-karki'
quickAnswer: 'TODO. A test webhook URL only listens while the editor is open and waiting. The production URL only exists once the workflow is active. Confirm the exact behaviour on the version you test.'
testedOn:
  date: 'TODO'
  versions:
    n8n: 'TODO'
    Coolify: 'TODO'
    Ubuntu: 'TODO'
  device: 'Oracle Always Free VM, 2 OCPU and 12 GB'
  testedBy: 'Ronit Karki'
```

## Record while testing

- n8n version exactly as the instance reports it.
- Both URLs as generated, with the host redacted, showing the path difference.
- The HTTP status and body returned when calling the test URL while inactive.
- The same for the production URL on an inactive workflow.
- What `WEBHOOK_URL` was set to, and what broke when it disagreed with the real host.
- Whether the request reached n8n at all, checked at the reverse proxy.
- The exact text of every error, including anything only visible in the container logs.

## Structure

1. Opening: who this is for. Link [Automation](/topics/automation/),
   [self-host n8n on Coolify](/self-host-n8n-coolify/) and
   [why automations fail silently](/automations-failing-silently/).
2. `## Test URL and production URL are different endpoints` — the main cause.
   Show both, show the status each returns when it is not listening.
3. `## The workflow is not active` — short, and explain why saving is not activating.
4. `## WEBHOOK_URL disagrees with the real hostname` — the self-hosting cause.
   This is the one the Coolify post already touches, so link rather than repeat.
5. `## The request never arrived` — checking at the proxy before blaming n8n.
6. `<WhatBroke>` — mandatory.

## FAQ to answer from the test

- Why does my webhook work in the editor and not after I close it?
- Does the production URL change when I rename the workflow?
- How do I see a request that n8n says it never received?

## Inbound links to add on publish

Add a line to `self-host-n8n-coolify` near the webhook discussion, and one to
`automations-failing-silently` under the trigger that stopped firing.
