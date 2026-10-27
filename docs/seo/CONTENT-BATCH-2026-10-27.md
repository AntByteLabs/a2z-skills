# Automation and hosting publication batch

The review started with 13 live posts and two unpublished template fixtures. Content validation passed and no live procedure was overdue for retesting. Three researched explainers extend the established automation and hosting clusters. They carry no invented test record, workflow download, version claim or hands-on review attribution.

| Article | Primary query | Related intent | Editorial angle |
| --- | --- | --- | --- |
| /n8n-item-linking-explained/ | n8n item linking | n8n .item vs .first; paired item data unavailable | Explain lineage versus positional selection, including a clearly hypothetical wrong-customer example |
| /webhook-retries-duplicate-events/ | duplicate webhook events | webhook retries; n8n duplicate webhook executions | Separate event identity, delivery identity and destination effects; distinguish Stripe from GitHub retry behaviour |
| /cloudflare-ssl-modes-explained/ | Cloudflare Full vs Full strict | Cloudflare Flexible vs Full; SSL modes; error 525 vs 526 | Scope the table to an HTTPS visitor, distinguish the two connection legs and explain certificate trust |

Keyword choices follow the site's audience, existing internal-link clusters, a search sample and current primary documentation. Search volumes, keyword difficulty and private Search Console performance were not measured. These are editorial choices, not a traffic forecast.

## Evidence and publication checks

- n8n sources: official item-linking concepts, error reference, Code-node pairing, node-output methods and itemMatching documentation, linked beside the relevant claims.
- Webhook sources: Stripe's webhook and idempotent-request references, GitHub's failed-delivery and webhook best-practice pages, and AWS Powertools' documented concurrency model.
- TLS sources: Cloudflare's individual Flexible, Full and Full (strict) references, Origin CA documentation and the separate 525/526 support pages.
- Every new article links to its hub and at least two other live posts. Existing automation posts link to both new automation explainers. The DNS and Workers-domain posts link to the SSL explainer. Both hubs list the additions.
- The new posts use the existing editor byline and researched-explainer disclosure. They do not attribute testing to Ronit or another person.
- Humanizer pass applied to all added prose: supported facts retained, hypothetical examples labelled, procedural claims and unsupported comparisons excluded.
- Three original covers generated with the built-in image_gen tool and optimised to 1440×960 WebP. Total source weight is 91,896 bytes. Exact prompts are in docs/design/art-prompts-2026-10-27.json and adjacent image sidecars. Assets are recorded in docs/design/art-assets-2026-10-27.json.
- Illustration tests discover all dated asset manifests so the new covers, responsive sources, image sitemap and sharing images receive the existing checks.

The external-source audit found one 404 in the existing silent-automation article: a vendor-hosted monitoring template. That paragraph now cites official execution-history documentation. Its update date reflects the correction. The audit artifact records the current source responses, not a guarantee of future availability.

The two old template fixtures remain unpublished: excel-xlookup-not-working and n8n-vs-make-vs-zapier. They still need real test evidence and editorial work. Existing author-photo and profile warnings require information from the actual authors; no photograph or profile was fabricated.

Post-brief issues: https://github.com/AntByteLabs/a2z-skills/issues/8, https://github.com/AntByteLabs/a2z-skills/issues/9 and https://github.com/AntByteLabs/a2z-skills/issues/10. The connected GitHub integration could not create issues in this repository; the existing authenticated GitHub CLI created them.

Final full check passed 9 unit tests and 140 browser tests, with 2 intentional desktop touch skips. All three new articles were checked at 320px, 390px, 768px and 1440px. Comparison tables scroll within labelled, keyboard-focusable regions; they do not widen the page. Mobile and desktop article and table captures were inspected. The final audit found no failed responses among 47 current external source URLs.

Lighthouse lab validation covered the homepage and each new article, one mobile run per URL. All four categories scored 100 in each run; the largest LCP was 1.205 seconds and CLS was 0. These local lab measurements do not establish field Core Web Vitals or search rankings. Measurements are in publication-lighthouse-2026-10-27.json.

Deployment status: the content is committed to main but remains unpublished on the live domain because Cloudflare's asset-upload-session endpoint returns HTTP 500 / error 10013. Authentication was refreshed successfully; repeated deploys and a minimal one-file session request still failed. See DEPLOYMENT-ERROR-2026-10-27.md for the prepared diagnostic report. The production site continues to show 13 posts. No external support report has been sent.
