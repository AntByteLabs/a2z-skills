# SEO measurement

Search Console is verified, according to the owner. No private performance
export or indexing report was available during implementation. The initial
Google click count and actual indexed count remain unmeasured.

## What the first reading showed, 27 October 2026

Zero clicks and zero impressions over every window up to 480 days. That is not
an indexing fault. The URL inspection API reported 29 of the 32 live URLs as
"Submitted and indexed", with Google's chosen canonical agreeing with ours on
every one of them. The three exceptions were published that morning and were
still unknown to Google.

Google's first crawl dates were 25 and 26 October, so the site was about two
days old in its index when this was read. Google also starts collecting
performance data when a property is added and takes a few days to accrue it.
Zero impressions at that point says the pages had not yet ranked for anybody's
query, not that anything is broken.

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

The key is not on the machine that runs this repo. The script reads
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

## Configure field measurement

The template supports PUBLIC_CF_WEB_ANALYTICS_TOKEN, the public beacon token
from the site's Cloudflare Web Analytics setup. Configure it as a build variable
and rebuild. The template validates the token's format and omits the script
when the value is absent.

No token was invented or copied from another account. The connected Cloudflare
app targets another account, and the project's CLI OAuth credential received
HTTP 403 for the Web Analytics site API. A role with access to this account's
Web Analytics setup, or the public beacon token from that setup, is required.

Do not enable automatic injection as well as a manually installed beacon.
Choose one installation method and verify a single beacon request on the live
site. Separate visitor measurements from Lighthouse lab scores.

## Weekly record

| Week ending      | Web clicks   | Impressions  | Indexed priority URLs | Main relevant queries   | Changes and next action                    |
| ---------------- | ------------ | ------------ | --------------------- | ----------------------- | ------------------------------------------ |
| Initial baseline | Not measured | Not measured | Not measured          | Awaiting private export | Technical and content corrections deployed |
| 27 Oct 2026, 480-day window | 0 | 0 | 0 clicks, 0 impressions | Read through the API | 29 of 32 URLs indexed, no canonical disagreements |

Use source/medium reporting for referral or social visits. Those visits are not
Google Search clicks, and page views are a separate measure again.

## What still needs the owner's account

- The service account's private key, so `npm run gsc` can run. The grant is
  already in place; only the key is missing locally.
- Search Console's indexing report. The API serves performance data, but
  Google's selected canonical and index coverage are read in the interface.
- The public Web Analytics token or account access sufficient to configure it.
- Verified public profile links for authors who have not supplied them.

Public fetches can check HTTP status and declared metadata. They cannot reveal
Google's selected canonical, prove indexing or manufacture historical traffic.
