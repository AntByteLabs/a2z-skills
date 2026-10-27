# Blog correction review, 27 October 2026

All 16 published articles were reviewed. Eleven received substantive corrections;
five retained their existing copy because their evidence and scope were already
appropriate. The two draft fixtures remain unpublished. No published URL changed.

The [per-article keyword and correction register](article-keywords-and-corrections.csv)
records the primary target, supporting terms, actual title, description, tags,
article type, correction and existing test record for every published blog.
Targets are editorial choices, not measured search volumes or rankings.

## What changed

- [Why AI detectors flag human writing](https://a2zskillsewa.com/ai-detectors-flagging-human-writing/): Reviewed; retained study-specific qualifications and false-positive interpretation. No factual correction required.
- [Why automations fail silently](https://a2zskillsewa.com/automations-failing-silently/): Removed implied hands-on testing and universal green-status claims; qualified authentication, pagination, retries and error handling; added relevant links to ChatGPT and Excel date conversion.
- [Why ChatGPT gives a different answer each time](https://a2zskillsewa.com/chatgpt-different-answers-same-question/): Removed universal product-instruction claim and model-version inference; kept API controls distinct from the ChatGPT interface.
- [Cloudflare SSL modes: Flexible, Full and Full (strict)](https://a2zskillsewa.com/cloudflare-ssl-modes-explained/): Reviewed; HTTPS-visitor assumption, two connections, origin certificate checks and Workers distinction retained. No factual correction required.
- [Cloudflare Workers custom domain not working](https://a2zskillsewa.com/cloudflare-workers-custom-domain-not-working/): Scoped nameserver advice to the tested full-zone setup; removed universal route workaround, login diagnosis and redirect limitation; retained observed commands and errors.
- [Deleting files did not free any disk space](https://a2zskillsewa.com/deleting-files-not-freeing-disk-space/): Corrected recoverability promise and open-handle absolutes; explained snapshot restore trade-off; removed unsupported promised future walkthrough.
- [DNS propagation explained](https://a2zskillsewa.com/dns-propagation-explained/): Aligned description, short answer and FAQ with authoritative publication, delegation, negative caching and serve-stale limits; removed instant-publication and exact-TTL guarantees.
- [Why Excel changes numbers into dates](https://a2zskillsewa.com/excel-changing-numbers-into-dates/): Aligned title and metadata with informational scope; corrected locale assumptions and recovery absolutes; explained conversion controls and text preservation without claiming a tested repair.
- [Why your Excel file is so large](https://a2zskillsewa.com/excel-file-size-too-large/): Replaced untested deletion/ZIP inspection steps and size promises with sourced mechanisms; corrected used-range, whole-column formatting and binary-format claims.
- [n8n item linking: why .item and .first() behave differently](https://a2zskillsewa.com/n8n-item-linking-explained/): Reviewed; documented matching-versus-positional selection and hypothetical examples remain appropriately bounded. No factual correction required.
- [n8n webhook not working: test and production 404s](https://a2zskillsewa.com/n8n-webhook-not-working/): Narrowed to the recorded 404 cases; retained original JSON; distinguished current 120-second listener/publication docs from older error wording; added official sources; removed response-format and HTTP-method absolutes.
- [Why a phone slows down as it gets older](https://a2zskillsewa.com/phone-slows-down-gets-older/): Replaced universal battery throttling and afternoon-repair promises with model-specific causes; removed reset guarantee and untested repair sequence.
- [Phone storage still full after deleting photos](https://a2zskillsewa.com/phone-storage-full-after-deleting-photos/): Reviewed; current Google documentation still states 30 days, including backed-up items. Existing correction and device/cloud distinctions retained.
- [Self-host n8n on Coolify: domain, API and email](https://a2zskillsewa.com/self-host-n8n-coolify/): Narrowed title and answer to recorded domain/API/email cases; bounded memory and template observations; distinguished internal REST APIs; corrected password-handling claim. Test date and outputs preserved.
- [Why webhooks arrive twice: retries and duplicate events](https://a2zskillsewa.com/webhook-retries-duplicate-events/): Reviewed; provider-specific retry, delivery identity, concurrency and idempotency distinctions retained. No factual correction required.
- [Why Windows has to restart to finish an update](https://a2zskillsewa.com/windows-restart-finish-installing-updates/): Corrected unconditional file locking, disk-bound timing and recovery-media claims; separated download/install/commit; linked current Microsoft sources.

The About and editorial-policy pages now distinguish test evidence from source
research, bylines and editorial review. Unsupported blanket human-review,
hardware-inventory and scheduled-job claims were removed. A person must still
test every published procedure. The three existing test records and their dates
were preserved; source checking did not become a new hands-on test.

The primary article illustration now loads eagerly with high fetch priority.
The audit identified it as the LCP element in mobile article samples. Card and
related-post images retain lazy loading. Artwork, URLs, ad settings, layout,
Cloudflare routes, D1 bindings and cache rules were preserved.

## Search Console baseline

The read-only performance request returned zero clicks and zero impressions for
29 September–27 October 2026. It returned no query or page rows. The API's zero
position in that empty result is not a measured rank. Recent dates can lag, so
this does not establish that no reader has ever seen a result.

URL Inspection confirmed the 13 older articles as submitted and indexed. The
three articles published on 27 October were still unknown to Google at this
check. That distinction matters: HTTP 200 and indexable metadata establish
technical eligibility, not inclusion in Google's index. Across all 32 sitemap URLs, 29 were submitted and indexed and three were unknown.
No different Google-selected canonical was reported for the indexed URLs.

## Verification

- `npm run check`: lint, worker type checking, nine unit tests, content validation,
  Astro checks/build, asset budgets, internal links and 140 browser tests passed.
  Two browser tests intentionally skip desktop-only pointer conditions.
- All 16 built articles returned 200, had one H1 matching their title, their
  expected descriptions and self-canonicals, and valid BlogPosting/FAQ data.
- Every visible FAQ answer matched its structured-data answer.
- No document overflow at widths 390, 768 or 1440 pixels; every article hero had
  alt text, eager loading and high fetch priority.
- All 57 distinct external article-source URLs returned 200 during this check.
- Mobile screenshots of the corrected Excel, n8n webhook and DNS pages were
  inspected. Existing tables retain their responsive treatment.
- Local mobile Lighthouse samples for home, DNS and n8n webhook each scored 100
  in performance, accessibility, best practices and SEO. LCP was 1.21–1.52 seconds;
  CLS and total blocking time were zero. These are lab samples, not field Core
  Web Vitals or evidence of search ranking. Assertions passed without uploading
  the reports to public Lighthouse storage.

The [release checks](release-checks.json) and [local Lighthouse samples](lighthouse-local.json)
record the measured values. Live deployment verification follows separately.

## What determines the next work

The next priority is discovery of the three new articles and collecting enough
Search Console observations to make a useful query comparison. Check indexing
and sitemap processing again after Google has had time to crawl; submitting a
sitemap does not guarantee indexing.

For further content, concentrate on automation and hosting questions that fit
the existing clusters. A new procedure needs a real workflow or deployment test,
the software version, distinguishable inputs and observed outputs. Excel repair
claims need an actual workbook and before/after evidence. Those records would
add more value than repeating broad keywords in more near-identical posts.

Review queries and pages weekly once observations exist. Use impressions to
find the questions Google associates with each page; compare the answer's scope
before changing a title for click-through rate. Do not treat all n8n pages as
cannibalising each other merely because they share a tag.

Clear answers, visible sources, honest testing labels and consistent structured
data support SEO and answer retrieval. None guarantees a featured answer, an AI
citation or 10,000 clicks this month. Author photographs and missing verified
profile links remain dependent on the real authors; no credentials were invented.
