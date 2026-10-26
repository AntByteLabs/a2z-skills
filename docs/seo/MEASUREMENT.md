# SEO measurement

Search Console is verified, according to the owner. No private performance
export or indexing report was available during implementation. The initial
Google click count and actual indexed count remain unmeasured.

## Record the baseline

In the verified a2zskillsewa.com property, record the date range, Web search
clicks, impressions, CTR and position. Inspect the two tested guides and two
corrected explainers, recording Google's selected canonical and indexing status.
Submit /sitemap-index.xml if it has not already been submitted.

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
| Initial baseline | Not measured | Not measured | Not measured          | Awaiting private export | Technical and content corrections prepared |

Use source/medium reporting for referral or social visits. Those visits are not
Google Search clicks, and page views are a separate measure again.

## What still needs the owner's account

- Search Console's actual indexing and performance data.
- The public Web Analytics token or account access sufficient to configure it.
- Verified public profile links for authors who have not supplied them.

Public fetches can check HTTP status and declared metadata. They cannot reveal
Google's selected canonical, prove indexing or manufacture historical traffic.
