# Research evidence — A2Z Skills — 26 October 2026

This log accompanies [the SEO plan](SEO-PLAN-2026-10-26.md) and [keyword map](keyword-map-2026-10-26.csv).

## Method and limits

The owner selected global English readers seeking automation, hosting and troubleshooting help and confirmed that Search Console is verified on a new site. Private Search Console data was not retrieved.

Research combined the 14 repository article files, a fresh 28-URL live sitemap crawl, a local build, selected live search results, current vendor documentation, first-person issue reports and 12 English-language autocomplete seeds. The initial article review covered two published articles; the later 12-article snapshot supersedes that initial count.

The 24 recorded search batches below include keyword samples, factual checks and SEO-policy checks. Up to four representative results are listed per batch; search-provider ordering is not a Google rank measurement. Some raw result sets contained irrelevant news, mirrors and outdated answers. They were not treated as technical authorities.

Use vendor documentation and original research for factual claims. Community reports establish that a problem has been reported; they do not establish prevalence or that an old workaround still applies. Competitor pages help assess formats and coverage, not prove a fix.

Autocomplete was requested with an English interface and without an enforced target country. It is a vocabulary/discovery signal, not search volume, rank, growth, conversion or keyword difficulty. An empty suggestion list is not proof of zero demand.

No monthly volume, KD, CPC, backlink, Google-selected canonical or actual indexed-count dataset was obtained. Those fields remain unknown. Proposed competition/priorities are editorial assessments, not numerical forecasts.

## Primary findings and sources

| Finding used in the plan                                                                                  | Source                                                                                                                                                                  |
| --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Some Excel automatic conversions are configurable; the date-like alphanumeric setting has explicit limits | [Microsoft: data import and analysis options](https://support.microsoft.com/en-us/excel/data-import-and-analysis-options-in-excel)                                      |
| Current Google Photos Help inspected says deleted photos/videos stay in trash for 30 days                 | [Google Photos: delete photos and videos](https://support.google.com/photos/answer/6128858?hl=en)                                                                       |
| Device-space removal is distinct from deleting cloud content                                              | [Google Photos: free up device space](https://support.google.com/photos/answer/6128843?hl=en)                                                                           |
| Webhook test/production registration is a distinct n8n behaviour                                          | [n8n Webhook documentation source](https://github.com/n8n-io/n8n-docs/blob/main/docs/integrations/builtin/core-nodes/n8n-nodes-base.webhook/README.md)                  |
| Schedule timezone is a documented troubleshooting topic                                                   | [n8n Schedule Trigger common issues](https://github.com/n8n-io/n8n-docs/blob/main/docs/integrations/builtin/core-nodes/n8n-nodes-base.scheduletrigger/common-issues.md) |
| Coolify template URL handling has a historical primary issue report                                       | [Coolify issue 7656](https://github.com/coollabsio/coolify/issues/7656)                                                                                                 |
| Custom-domain prerequisites differ from generic Pages/origin advice                                       | [Cloudflare Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)                                                            |
| Worker self-fetch is one documented 522 case                                                              | [Cloudflare error 522](https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-5xx-errors/error-522/)                                    |
| Crawl requests are not immediate indexing guarantees                                                      | [Google recrawl requests](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)                                                            |
| A crawler must access HTML to read noindex                                                                | [Google noindex documentation](https://developers.google.com/search/docs/crawling-indexing/block-indexing)                                                              |
| Accurate lastmod matters; priority/changefreq are ignored by Google                                       | [Google sitemap documentation](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)                                                      |
| llms.txt is not used as a Google Search ranking/visibility mechanism                                      | [Google AI optimisation guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)                                                            |
| Google-Extended is not the Google Search inclusion control                                                | [Google common crawlers](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers)                                                          |
| Sitelinks search-box visual feature was removed in 2024                                                   | [Google announcement](https://developers.google.com/search/blog/2024/10/sitelinks-search-box)                                                                           |
| Current updates state FAQ rich results are no longer shown                                                | [Google documentation updates](https://developers.google.com/search/updates)                                                                                            |

The Google Photos duration is a current-documentation observation, not an assertion that all historical app versions behaved identically. The Excel option does not promise to stop every slash, hyphen or spaced date expression. Both article corrections need product-version checking.

## Search samples

### automation

Query: n8n workflow not running production webhook test works

- [Webhook works in test but not in production? The test vs. production URL trap - Tips & Tricks - n8n Community](https://community.n8n.io/t/webhook-works-in-test-but-not-in-production-the-test-vs-production-url-trap/318716?tl=en)
- [n8n-docs/docs/integrations/builtin/core-nodes/n8n-nodes-base.webhook/workflow-development.md at main · n8n-io/n8n-docs · GitHub](https://github.com/n8n-io/n8n-docs/blob/main/docs/integrations/builtin/core-nodes/n8n-nodes-base.webhook/workflow-development.md)
- [n8n webhook dead in production: the checklist](https://nordflux.de/en/guides/webhook-works-in-testing-but-not-in-production-the-checklist)
- [n8n-docs/docs/integrations/builtin/core-nodes/n8n-nodes-base.webhook/README.md at main · n8n-io/n8n-docs · GitHub](https://github.com/n8n-io/n8n-docs/blob/main/docs/integrations/builtin/core-nodes/n8n-nodes-base.webhook/README.md)

### cloudflare

Query: cloudflare workers custom domain not working 100117 522

- [Error 522 · Cloudflare Support docs](https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-5xx-errors/error-522/)
- [Custom Domains · Cloudflare Workers docs](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [Custom domains · Cloudflare Pages docs](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Custom domains · Cloudflare Workers docs](https://developers.cloudflare.com/workers/previews/custom-domains/)

### comparisons

Query: n8n vs make vs zapier

- [n8n vs. Make: Which is best? 2026 | Zapier](https://zapier.com/blog/n8n-vs-make/)
- [n8n vs Make vs Zapier: Which Should You Use? | encnt](https://www.encnt.com/insights/n8n-vs-make-vs-zapier)
- [n8n vs Make vs Zapier for businesses](https://automationsflow.com/blog/n8n-vs-make-vs-zapier)
- [Zapier vs Make vs n8n: Pricing Compared (2026) | ZeniTech](https://zenitech.dev/en/guides/zapier-vs-make-vs-n8n)

### excel_size

Query: excel file too large used range reduce file size

- [Excel performance - Tips for optimizing performance obstructions | Microsoft Learn](https://learn.microsoft.com/en-us/office/vba/excel/concepts/excel-performance/excel-tips-for-optimizing-performance-obstructions)
- [Reduce the file size of your Excel spreadsheets | Microsoft Support](https://support.microsoft.com/en-us/excel/reduce-the-file-size-of-your-excel-spreadsheets)
- [What to do if a data set is too large for the Excel grid | Microsoft Support](https://support.microsoft.com/en-us/excel/what-to-do-if-a-data-set-is-too-large-for-the-excel-grid)
- [How to Reduce Excel File Size Without Losing Data](https://www.expresssheet.com/blog/reduce-excel-file-size/)

### excel_dates

Query: stop excel changing numbers to dates

- [Stop automatically changing numbers to dates | Microsoft Support](https://support.microsoft.com/en-au/excel/stop-automatically-changing-numbers-to-dates)
- [Format numbers | Microsoft Support](https://support.microsoft.com/en-us/excel/format-numbers)
- [How to Prevent Excel from Changing Numbers to Dates](https://www.statology.org/stop-excel-from-changing-numbers-to-dates/)
- [How to Stop Excel from Changing Numbers to Dates Automatically](https://trumpexcel.com/stop-excel-from-changing-numbers-to-dates/)

### storage

Query: iphone storage full after deleting photos android storage full

- [Free up storage on your Android device - Android Help](https://support.google.com/android/answer/7431795?hl=en)
- [Android Storage Full After Deleting Files? Causes and Fixes](https://www.itechguides.com/why-is-my-android-phone-storage-still-full-after-deleting-files/)
- [iPhone storage full after deleting photos? Here's why | deja](https://deja.photos/guides/iphone-storage-full-but-photos-wont-delete)
- [Why Does Android Still Say Storage Is Full After I Delete Files? – PHWhy](https://phwhy.com/mobile-iphone-android/why-android-storage-full-after-deleting-files/)

### dns

Query: dns propagation explained how long ttl nameserver

- [What is DNS propagation? | DigiCert FAQ](https://www.digicert.com/faq/dns/what-is-dns-propagation)
- [How Long Does DNS Propagation Take? How It Works | WHOIS Query](https://www.whoisquery.net/guides/dns-propagation)
- [DNS Propagation – Explained - Domains - Namecheap.com](https://www.namecheap.com/support/knowledgebase/article.aspx/9622/10/dns-propagation-explained/)
- [DNS Propagation – Explained - Domains - Namecheap.com](https://www.namecheap.com/support/knowledgebase/article/9622/10/dns-propagation-explained/)

### windows

Query: why windows needs restart after updates

- [Microsoft wants Edge to install security updates without restarting](https://www.windowscentral.com/microsoft/windows-11/microsoft-edge-browser-updates-without-restarts-prototype)
- [One restart a month for Windows updates | Microsoft Support](https://support.microsoft.com/en-us/servicing/os/windows/docs/2026/07/kb5121772-one-restart-a-month-for-windows-updates)
- [Manage device restarts after updates | Microsoft Learn](https://learn.microsoft.com/en-us/windows/deployment/update/waas-restart)
- [Windows Update: FAQ | Microsoft Support](https://support.microsoft.com/en-us/windows/deployment/updates-lifecycle/windows-update-faq)

### chatgpt

Query: why chatgpt gives different answers to same question

- [America Is About to See What Happens When Voters Turn to AI](https://www.theatlantic.com/technology/2026/10/ai-midterm-election-voters-chatbots/689103/?utm_source=openai)
- [Why ChatGPT Gives Different Answers to the Same Prompt](https://www.itechguides.com/why-chatgpt-can-answer-the-same-prompt-differently/)
- [Does ChatGPT Give Everyone The Same Answers?](https://aisearch.similarweb.com/blog/chatgpt-same-answers/)
- [Does ChatGPT tell the truth? | OpenAI Help Center](https://help.openai.com/en/articles/8313428-does-chatgpt-tell-the-truth%3F.pls)

### detectors

Query: why ai detectors flag human writing false positives

- [Can AI Detectors Be Wrong? What a Score Proves | AFIP](https://afip.org/guides/can-ai-detectors-be-wrong/)
- [AI detectors rarely flag human writing, but sometimes miss AI text imitating real authors | Epoch AI](https://epoch.ai/data-insights/ai-detectors-false-negatives?trk=article-ssr-frontend-pulse_little-text-block)
- [The pitfalls of AI detection in academic writing: bias, false positives, and the need for inclusive assessment | AI and Ethics | Springer Nature Link](https://link.springer.com/article/10.1007/s43681-026-01376-w)
- [How AI Detection Actually Works (and Fails) — CASRAI](https://casrai.org/guides/how-ai-detection-actually-works)

### phone_speed

Query: why phone slows down as it gets older

- [Why does my phone slow down or lag? - SamMobile](https://www.sammobile.com/news/why-does-my-phone-slow-down-or-lag/)
- [Why do computers, smart phones and other devices slow down over time? - ABC News](https://www.abc.net.au/news/2017-10-23/why-computers-and-smart-phones-slow-down-over-time/9070932)
- [Why do phones get slow over time beyond updates? - SamMobile](https://www.sammobile.com/news/why-do-phones-get-slow-over-time-beyond-updates/)
- [Why our computing devices seem to slow down with age](https://lens.monash.edu/why-our-computing-devices-seem-to-slow-down-with-age/)

### excel_conversion

Query: site:support.microsoft.com excel automatic data conversion convert letters numbers date options

- [Data import and analysis options in Excel | Microsoft Support](https://support.microsoft.com/en-us/excel/data-import-and-analysis-options-in-excel)
- [Advanced options | Microsoft Support](https://support.microsoft.com/en-us/excel/advanced-options)
- [Date systems in Excel | Microsoft Support](https://support.microsoft.com/en-us/excel/date-systems-in-excel)
- [Keeping leading zeros and large numbers | Microsoft Support](https://support.microsoft.com/en-us/excel/keeping-leading-zeros-and-large-numbers)

### google_photos

Query: site:support.google.com/photos trash 60 days 30 days backed up free up space

- [About your Google Photos activity & storage - Google Photos Help](https://support.google.com/photos/answer/10100180?hl=en)
- [Delete photos & videos - Android phone & tablet - Google Photos Help](https://support.google.com/photos/answer/6128858?co=GENIE.Platform%3DAndroid&hl=en-en)
- [About your Google Photos activity & storage - Google Photos Help](https://support.google.com/photos/answer/10100180?hl=en-en)
- [Free up space on your device - Android phone and tablet - Google Photos Help](https://support.google.com/photos/answer/6128843?hl=en-IN)

### google_ai

Query: site:developers.google.com/search AI features llms.txt Google Extended AI Overviews

- [Google's Guide to Optimizing for Generative AI Features on Google Search | Google Search Central  |  Documentation  |  Google for Developers](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [Latest Google Search Documentation Updates | Google Search Central  |  What's new  |  Google for Developers](https://developers.google.com/search/updates)
- [AI Features and Your Website | Google Search Central  |  Documentation  |  Google for Developers](https://developers.google.com/search/docs/appearance/ai-features?product=breeze)
- [Latest Google Search Documentation Updates | Google Search Central  |  What's new  |  Google for Developers](https://developers.google.com/search/updates?authuser=01&hl=en)

### schema_changes

Query: site:developers.google.com/search sitelinks search box removed November 2024 FAQ rich results government health

- [Farewell, Sitelinks Search Box  |  Google Search Central Blog  |  Google for Developers](https://developers.google.com/search/blog/2024/10/sitelinks-search-box?hl=en)
- [Latest Google Search Documentation Updates | Google Search Central  |  What's new  |  Google for Developers](https://developers.google.com/search/updates)
- [Latest Google Search Documentation Updates | Google Search Central  |  What's new  |  Google for Developers](https://developers.google.com/search/updates?afsrc=1)
- [Latest Google Search Documentation Updates | Google Search Central  |  What's new  |  Google for Developers](https://developers.google.com/search/updates?authuser=01&hl=en)

### schedule

Query: n8n schedule trigger not running timezone

- [n8n-docs/docs/integrations/builtin/core-nodes/n8n-nodes-base.scheduletrigger/common-issues.md at main · n8n-io/n8n-docs · GitHub](https://github.com/n8n-io/n8n-docs/blob/main/docs/integrations/builtin/core-nodes/n8n-nodes-base.scheduletrigger/common-issues.md)
- [n8n Schedule Trigger not working: 7 causes we tested](https://tasktoagent.com/guides/n8n-schedule-trigger-not-working/)
- [n8n/packages/@n8n/scheduler/README.md at master · n8n-io/n8n · GitHub](https://github.com/n8n-io/n8n/blob/master/packages/%40n8n/scheduler/README.md)
- [Schedule Trigger node documentation | n8n Docs](https://n8n-docs.teamlab.info/integrations/builtin/core-nodes/n8n-nodes-base.scheduletrigger/)

### silent

Query: n8n workflow successful but no output empty items

- [Monitor empty successful workflows via the n8n API, Data Tables and Slack | n8n workflow template](https://n8n.io/workflows/18914-monitor-empty-successful-workflows-via-the-n8n-api-data-tables-and-slack/)
- [n8n workflow succeeded but no output · OutcomeGuard](https://outcomeguard.dev/successful-but-no-output)
- [Empty Output Flow Break - Questions - n8n Community](https://community.n8n.io/t/empty-output-flow-break/280247?tl=en)
- [How to catch workflows that succeed but do nothing (free method)](https://www.reddit.com/r/n8n/comments/1x9e9jn/how_to_catch_workflows_that_succeed_but_do/)

### wrangler

Query: wrangler login No CSRF value available session cookie

- [Dynamic content and login issues · Cloudflare Cache (CDN) docs](https://developers.cloudflare.com/cache/troubleshooting/dynamic-content-and-login-issues/)
- [Log in to Wrangler without a local callback server · Changelog](https://developers.cloudflare.com/changelog/post/2026-08-04-wrangler-login-device-flow/)
- [General commands · Cloudflare Workers docs](https://developers.cloudflare.com/workers/wrangler/commands/general/)
- [Bringing OAuth 2.0 to Wrangler | Cloudflare Blog](https://blog.cloudflare.com/wrangler-oauth/)

### oauth

Query: coolify n8n oauth redirect_uri_mismatch SERVICE_URL_N8N

- [Bug: n8n service template: OAuth broken after n8n 2.0 - uses SERVICE_FQDN instead of SERVICE_URL · Issue #7656 · coollabsio/coolify · GitHub](https://github.com/coollabsio/coolify/issues/7656)
- [n8n-docs/docs/integrations/builtin/credentials/google/oauth-single-service.md at main · n8n-io/n8n-docs · GitHub](https://github.com/n8n-io/n8n-docs/blob/main/docs/integrations/builtin/credentials/google/oauth-single-service.md)
- [Google | Coolify Docs](https://next.coolify.io/docs/core/security/authentication/oauth/google)
- [Oauth Redirect URL unable to change - Questions - n8n Community](https://community.n8n.io/t/oauth-redirect-url-unable-to-change/206893)

### worker_exact

Query: cloudflare workers custom domain not working

- [Custom Domains · Cloudflare Workers docs](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [Custom domains · Cloudflare Workers docs](https://developers.cloudflare.com/workers/previews/custom-domains/)
- [Routes and domains · Cloudflare Workers docs](https://developers.cloudflare.com/workers/configuration/routing/?trk=article-ssr-frontend-pulse_little-text-block)
- [cloudflare-docs/src/content/docs/workers/configuration/routing/custom-domains.mdx at production · cloudflare/cloudflare-docs · GitHub](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/workers/configuration/routing/custom-domains.mdx)

### disk

Query: deleted files but disk space still full mac windows

- [Deleted Files but Mac Storage Is Still Full? · Diskfern](https://www.diskfern.com/blog/mac-storage-not-freed-after-deleting-files)
- [Windows File Recovery | Microsoft Support](https://support.microsoft.com/en-us/windows/experience/backup-recovery/windows-file-recovery)
- [Available disk space does not increase after deleting files | Seagate UK](https://www.seagate.com/gb/en/support/kb/lacie/available-disk-space-does-not-increase-after-deleting-files-006369en/)
- [Free up drive space in Windows | Microsoft Support](https://support.microsoft.com/en-us/windows/experience/storage-filemanagement/free-up-drive-space-in-windows)

### workers_error

Query: cloudflare workers custom domain 100117 existing DNS record

- [Custom Domains · Cloudflare Workers docs](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [cloudflare-docs/src/content/docs/workers/configuration/routing/custom-domains.mdx at production · cloudflare/cloudflare-docs · GitHub](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/workers/configuration/routing/custom-domains.mdx)
- [Custom Domains · Cloudflare Workers docs](https://cloudflare-docs-7ou.pages.dev/workers/configuration/routing/custom-domains/)
- [Custom Domains · Cloudflare Workers docs](https://docs.kabirsikand.com/workers/platform/routing/custom-domains/)

### xlookup

Query: xlookup not working numbers text NA NAME

- [XLOOKUP Not Working | Microsoft Community Hub](https://techcommunity.microsoft.com/t5/excel/xlookup-not-working/td-p/4277979)
- [Numbers Stored as Text Stop Lookups Working: Fixes](https://analistable.com/blog/numbers-stored-as-text-stop-lookups-working)
- [XLOOKUP() : Excel's Most Versatile Lookup Function | DataCamp](https://www.datacamp.com/tutorial/xlookup-excel)
- [How to correct a #N/A error | Microsoft Support](https://support.microsoft.com/en-us/excel/how-to-correct-a-n-a-error?ad=us&rs=en-us&ui=en-us)

### error_validation

Query: "Cloudflare" "100117"; "n8n" "Coolify" "no available server"

- [Bug: Unable to consistently install docker-compose based images with custom domains · Issue #6477 · coollabsio/coolify · GitHub](https://github.com/coollabsio/coolify/issues/6477)
- [Coolify Zero Downtime Deployments: Measured and Fixed - LearnWithHasan](https://learnwithhasan.com/guide/coolify-zero-downtime-deployment/)
- [Coolify self-hosted install on a VPS: your own Heroku and Vercel — ForestsNet Cloud](https://forestsnet.cloud/en/wiki/development/coolify-paas)
- [Install Coolify in 2026: Starter Guide (Postgres, Redis, MongoDB) - LearnWithHasan](https://learnwithhasan.com/guide/install-coolify-2026-starter/)

## How to use the keyword map

Each CSV row is an intent to improve, research or explicitly hold. Rows are not a requirement to create separate URLs. Status distinguishes published pages, template drafts, new candidates, section-first ideas and lower-confidence future work.

“Not measured” volume and difficulty values are intentional. Check intent overlap before commissioning a separate guide. The n8n external-URL and OAuth cases may belong together. Broad DNS checker intent should not be confused with an explanation article.

The highest-priority new briefs are production webhook diagnosis, wrong external URL on Coolify, Schedule Trigger diagnosis and Worker-specific 522 diagnosis, after human testing. Later candidates depend on distinct evidence.

## Autocomplete capture

The full capture is in [autocomplete-2026-10-26.json](autocomplete-2026-10-26.json). Its seeds were:

- n8n coolify
- n8n webhook not working
- n8n schedule trigger not running
- n8n workflow successful no output
- cloudflare workers custom domain
- wrangler login csrf
- dns propagation
- excel file too large
- excel changing numbers to dates
- xlookup not working
- iphone storage full after deleting photos
- android storage full after deleting files

Notable observations: production-webhook and iPhone-storage variants appeared; the exact empty-output, Wrangler CSRF and Android-file-deletion seeds returned empty lists. The Schedule Trigger seed returned its own phrase. None of these observations quantifies monthly demand.

## Audit files and reproducibility

[live-audit-2026-10-26.json](live-audit-2026-10-26.json) records fetched public titles, canonicals, indexing metadata, H1s, images, structured-data JSON and discovered links for the 28 sitemap URLs. It contains no subscriber records or private analytics.

Additional live browser checks confirmed /search/?q=n8n had an empty initial input and a constructor error on focus, and a deliberately nonexistent URL returned HTTP 404. A build-graph scan found ten tag pages without incoming anchor links. These are separate checks from the live sitemap snapshot.

The local build and content validator passed during research; current content validation emitted five author-profile/photo warnings. The source tree was being updated concurrently. Recheck before implementation, and do not treat this dated report as evidence of the current state after later deployments.

No full backlink audit, geographic rank tracking, keyword-planner export, field Core Web Vitals evaluation, accessibility audit or private Search Console review was performed. Those remain distinct next steps if evidence shows they are needed.
