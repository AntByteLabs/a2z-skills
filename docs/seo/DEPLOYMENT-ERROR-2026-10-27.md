# Cloudflare asset upload blocks the content release

The three new explainers are committed on main at c992625. They are not live. The production homepage still contains 13 article cards; the prepared build contains 16. The existing site remains available.

## Completed work

- Three researched articles, original responsive covers, source citations, FAQs and internal links.
- One broken external source corrected in the existing automation explainer.
- 47 current source URLs returned successful responses.
- Full check: 9 unit tests and 140 browser tests passed, with 2 intentional desktop touch skips.
- Four mobile Lighthouse lab runs: 100 in every category, CLS 0, maximum LCP 1.205 seconds.
- New articles checked at 320px, 390px, 768px and 1440px; tables remain within keyboard-focusable scroll regions.

## Deployment evidence

The first deploy found an expired local OAuth session. `wrangler whoami` refreshed it successfully and confirmed the existing Antbytelabs account and Workers permissions. An authenticated read of the production Worker's settings succeeded.

Subsequent deployment attempts failed at:

```text
POST /accounts/<redacted>/workers/scripts/a2z-skills/assets-upload-session
HTTP 500
Cloudflare error 10013: An unknown error has occurred.
```

A direct minimal upload-session request with a single /index.html manifest entry also returned HTTP 500 / error 10013. This isolated the failure from the complete 428-file build. Diagnostic Cloudflare Ray ID: a510f20939fc9e82-KTM. The probe did not upload assets or publish a Worker version.

Environment: macOS, Node 26.11.1, Wrangler 4.152.0. The deployment command was `wrangler deploy --keep-vars`. No route, D1 binding, cache policy, monetisation flag or hosting plan changed. No secrets are included in this report.

The status API reported no open incidents at the time of the final check. This does not rule out an account-specific or unreported service problem. Similar official SDK reports document this error at the same endpoint:

- https://github.com/cloudflare/workers-sdk/issues/13118
- https://github.com/cloudflare/workers-sdk/issues/11153

These reports do not prove the cause of this particular failure. Further investigation requires a successful later retry or help from Cloudflare. No external support report has been sent.

## Prepared public bug report

Title: Workers Assets upload-session returns HTTP 500 / 10013 for an existing Worker

A previously deployed Worker with Static Assets can no longer create an asset upload session. Repeated `wrangler deploy --keep-vars` attempts return HTTP 500 / code 10013 before any assets are uploaded. An authenticated settings read succeeds, and a minimal direct session request containing one /index.html manifest entry fails identically.

Worker: a2z-skills. Account ID can be supplied through an appropriate private channel. Cloudflare Ray ID from the minimal request: a510f20939fc9e82-KTM. Occurred on 27 October 2026, around 10:14–10:19 UTC. Wrangler 4.152.0; Node 26.11.1; macOS.

The application build, validation and browser checks pass. The full build contains 428 files, but the single-file session probe fails too. OAuth was refreshed and the account confirmed. No configuration or plan changes preceded this release. The existing deployment continues to serve traffic. Could the Workers Assets team investigate the upload-session failure?

## Resolved, 27 October 2026

The failure was transient. A repeat of the same minimal probe, one `/index.html`
manifest entry against the same endpoint, returned HTTP 200 with a session JWT
at 10:43 UTC. The earlier failures ran between roughly 10:14 and 10:19 UTC.
Nothing was sent to the endpoint between those attempts and the successful one,
so how long it stayed broken is not known.

`wrangler whoami` confirmed the same OAuth session and `workers_scripts (write)`
before the retry. No token was reissued, and no configuration, route, binding or
plan changed between the failed and successful attempts. The cause on
Cloudflare's side is still unknown. The prepared bug report above was never sent
and is now moot.

`npm run deploy` then completed: all gates passed, 117 assets uploaded with 254
already present, version ID `2551ac2d-f8c3-4d32-b226-c54e1be84de3`. Wrangler
retried one asset upload once, and it succeeded.

Post-deploy verification against the live domain:

- The sitemap lists 32 URLs, up from 29, with no duplicates.
- All 32 return HTTP 200, each with a self-referencing canonical and no
  `noindex`.
- The homepage shows 16 posts, up from 13, including all three new explainers.
- `http` to `https`, `www` to apex, and missing trailing slashes all redirect.
- 178 image tags across 48 built pages all carry an `alt` attribute.
- `npm run stale` reports nothing overdue across the 16 live posts.

The post-deploy IndexNow ping submitted nothing, because it diffs `HEAD~1..HEAD`
and the commit at `HEAD` changed only documentation. The 12 affected URLs were
submitted separately over the `a7c9cf8..HEAD` range and IndexNow returned 200.
Google ignores IndexNow and will read the sitemap instead.
