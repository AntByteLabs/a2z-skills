# SEO measurement

Search Console is verified and the service-account integration is working.
Performance, indexing and sitemap status can now be read through the repo script.
The [27 October correction review](corrections-2026-10-27/REVIEW.md) records the
latest content checks and a dated indexing snapshot.

## What the first reading showed, 27 October 2026

Zero clicks and zero impressions over every window up to 480 days. That is not
an indexing fault. The URL inspection API reported 29 of the 32 live URLs as
"Submitted and indexed", with Google's chosen canonical agreeing with ours on
every one of them. The three exceptions were published that morning and were
still unknown to Google.

Google's first crawl dates were 25 and 26 October, so the site was about two
days old in its index when this was read. Google also starts collecting
performance data when a property is added and takes a few days to accrue it.
With reporting delay and such a short history, zero impressions do not yet
establish why the property has no reported search observations.

Search Console had last downloaded the child sitemap on 26 October, before the
three new posts existed, and reported 19 URLs. Submitting it again through the
API brought it to 32 web and 16 image URLs the same minute.

All 49 external links in the build returned a successful status on the same day.

## Record the baseline

In the verified a2zskillsewa.com property, record the date range, Web search
clicks, impressions, CTR and position. Inspect the two tested guides and two
corrected explainers, recording Google's selected canonical and indexing status.
Submit /sitemap-index.xml if it has not already been submitted.

## Reading it from this repo

`npm run gsc` queries the Search Console API with a Google service account and
prints the totals, top queries and top pages. The other modes:

| Command | What it shows |
| --- | --- |
| `npm run gsc -- --sites` | properties the account can read, and its role |
| `npm run gsc -- --index` | index status and Google's chosen canonical, per URL |
| `npm run gsc -- --sitemaps` | what Search Console holds for each sitemap |
| `npm run gsc -- --submit` | asks Google to re-read the sitemaps |

Everything is read-only except `--submit`, which asks for the read/write scope.
Re-reading the sitemap index does not make Google re-read the child sitemap it
points at, so `--submit` sends both.

The account `antbytelabs@project-8d191be8-b32a-46d2-bc6.iam.gserviceaccount.com`
was added to the a2zskillsewa.com property as a user on 27 October 2026. The
same account already reads the antbytelabs.com property, where its key is held
in that site's deployment environment.

The key stays outside the repository. The script reads
`GSC_CLIENT_EMAIL` and `GSC_PRIVATE_KEY`, or a service account JSON key at
`GSC_KEY_FILE`, defaulting to `~/oracle-free/gsc-service-account.json`. Nothing
in this repository holds the key, and nothing should.

The script asks the API which property form is granted rather than assuming one,
because a domain property is addressed as `sc-domain:a2zskillsewa.com` and a URL
prefix property as `https://a2zskillsewa.com/`, and only the granted form works.

Google reports search data two to three days behind, so the most recent days of
any window are incomplete.

Keep private exports outside the public repository. Record aggregate findings
and the change date in a report. Compare a 28-day view with weekly snapshots
once enough observations exist; a new site's first few days are a small sample.

## Field measurement

The live site was checked with one Cloudflare analytics beacon returning 200
and its reporting request returning 204. Do not add a second installation.
This confirms delivery of the beacon, not the values in the private analytics
dashboard or enough traffic for representative field Core Web Vitals.

The template supports `PUBLIC_CF_WEB_ANALYTICS_TOKEN` when a manual installation
is needed. No token should be invented or copied from another account. Changes
to analytics should first establish whether Cloudflare automatic injection is
already providing it.

## Weekly record

| Checked on | Web search range | Clicks | Impressions | Indexed article URLs | Query observations |
| --- | --- | --- | --- | --- | --- |
| 27 Oct 2026 | 29 Sep–27 Oct 2026 | 0 | 0 | 13 of 16; newest three unknown | No rows returned |

The full sitemap has 32 URLs: URL Inspection returned 29 indexed and three
unknown, with no canonical disagreements reported. An empty performance result
has no observed average ranking; the API's zero value should not be read as
position zero.

Use source/medium reporting for referral or social visits. Those visits are not
Google Search clicks, and page views are a separate measure again.

## What still needs real evidence

- Verified public profile links and photographs supplied by the authors.
- Enough Search Console query observations to assess rankings and click-through rate.
- Access to analytics reports when evaluating readership and field performance.
- A named person's new test record before publishing or claiming a re-tested procedure.

Public fetches can check HTTP status and declared metadata. Search Console URL
Inspection supplies Google's recorded index state and selected canonical. Neither
check manufactures traffic or proves that a correction improved rankings.
