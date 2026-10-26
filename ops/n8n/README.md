# n8n automations

n8n runs on the Oracle Always Free server, deployed through Coolify as the
service `n8n` in the **Tools** project.

- **Editor:** https://n8n.apps.antbytelabs.com
- **Version:** n8n 2.10.2 with the JavaScript and Python task runners
- **Service uuid:** `citjvi7i6byqkriqljgsnlap`
- **Storage:** SQLite on a Coolify volume. Execution data is pruned after 14
  days or 5,000 runs (`EXECUTIONS_DATA_PRUNE`).

The domain is set through the API after all. `PATCH /api/v1/services/{uuid}`
takes a `urls` array of `{name, url}`, where `name` is the compose service name:

```bash
curl -X PATCH "https://coolify.antbytelabs.com/api/v1/services/citjvi7i6byqkriqljgsnlap" \
  -H "Authorization: Bearer $COOLIFY_TOKEN" -H "Content-Type: application/json" \
  -d '{"urls":[{"name":"n8n","url":"https://n8n.apps.antbytelabs.com"}]}'
```

`SERVICE_FQDN_N8N` does not do it: Coolify regenerates that from the stored
domain on deploy. Change `N8N_HOST`, `WEBHOOK_URL` and `N8N_EDITOR_BASE_URL` to
match at the same time, or form and webhook URLs keep the old hostname.

## First run

1. Open the editor and create the owner account. Keep the password in your
   password manager, not in this repo.
2. Add the credentials the workflows expect. Nothing here stores a secret:

   | Credential name       | Type                                                                          | Used by |
   | --------------------- | ----------------------------------------------------------------------------- | ------- |
   | `GitHub — a2z-skills` | GitHub API, fine-grained token with Issues: write on `AntByteLabs/a2z-skills` | 01      |
   | `SMTP — antbytelabs`  | SMTP (the Gmail app password already on the server)                           | 02, 03  |

3. Add these as **service environment variables in Coolify**, not in the
   workflows, then redeploy:

   | Variable            | What it is                                              |
   | ------------------- | ------------------------------------------------------- |
   | `GITHUB_TOKEN`      | Fine-grained token with Actions: write, for workflow 04 |
   | `CF_ACCOUNT_ID`     | Cloudflare account id                                   |
   | `CF_D1_DATABASE_ID` | The `a2z-skills` D1 database id                         |
   | `CF_D1_READ_TOKEN`  | Cloudflare token scoped to **D1: Read** only            |

4. Import each workflow: **Workflows → Import from file**, then open every node
   once. n8n rewrites node parameters between versions, so a node that was
   imported from JSON should be looked at before the workflow is activated.
5. Activate one at a time and run it once by hand first.

## The workflows

### 01 — topic to post brief

A form you fill in with a keyword, pillar and type. It opens a brief issue on
`AntByteLabs/a2z-skills` with the same checklist as the issue template and the
exact `npm run new` command to scaffold the post. Keeps the queue fed without
anyone writing Markdown by hand.

### 02 — post-publish health check

Every six hours: reads the live sitemap, fetches every URL in it, and emails if
any page is not 200, is marked `noindex` while sitemapped, canonicalises
somewhere else, or has lost its structured data. These are the failures no local
test can catch, because they only exist once Cloudflare is serving the page.

### 03 — weekly subscriber report

Monday 08:00: queries D1 through the Cloudflare API for subscriber totals and
which pages people signed up from, and emails the counts. **Counts only — no
email address ever leaves D1.** The token it uses is read-only.

### 05 — posts due for re-testing

Monday 07:00: reads the live sitemap, fetches each post, pulls the rendered
"Tested on" date out of the page and emails anything past 120 days. This
replaces the GitHub Actions job that used to open an issue. It needs no
repository access and no credentials beyond SMTP, because the tested-on date is
published on the page.

### 04 — hero image to pull request

A form that takes a post slug, a public image URL and alt text, then triggers the
`add-image.yml` GitHub Action. The action downloads the image, re-encodes it to
WebP at 1600px, strips metadata, rebuilds the site to prove it still passes, and
opens a pull request. Nothing reaches the live site until that PR is merged.

This is where generated images come in: generate the image wherever you like,
put it somewhere publicly reachable over https, and paste the URL into the form.

## What is deliberately not automated

- **Publishing.** Every post needs a person to test it and a deploy to go live.
  No workflow here writes to `main`.
- **Adding images.** GitHub Actions is disabled on the repository, so this runs
  locally: `npm run image -- <slug> "<https url>" "<alt text>"`. Generate the
  image wherever you like, put it somewhere publicly reachable, pass the URL.
- **Sending email to subscribers.** Workers can only send to arbitrary
  recipients on the paid plan. Addresses are collected now and will be mailed
  from a newsletter tool's free tier later.
- **Uptime monitoring.** Uptime Kuma already does that on the same server. Add
  `a2zskillsewa.com` as a monitor there rather than building it here.
- **Running the test suite.** That is `npm run check` on a machine with the
  repository, not a job here.
- **Writing prose.** Drafting happens in Claude Code against `CLAUDE.md`, where
  the house rules and `/humanizer` apply.

## Keeping the server at $0

n8n adds roughly 550 MB of resident memory, which _helps_: Oracle reclaims an
Always Free VM only when CPU, network **and memory** all sit under 20% for seven
days, and `oracle-guard` warned that memory was at 22.6% before this went on.
Check with `ssh ubuntu@161.118.175.122 oracle-guard` after any change.

### 06 — publish new posts to Facebook and Instagram

Polls `rss.xml` hourly. For each genuinely new post it writes a link post on the
Facebook Page and an image post on Instagram, then checks that both actually
returned an id and emails if either did not.

**It posts a link on Facebook and an image on Instagram, because that is what
each network allows.** Facebook renders the article card from the page's own
Open Graph tags, so the preview image, title and description come from the post
and nothing has to be duplicated here. Instagram does not allow a clickable
link in a caption at all, so the caption ends with "link in bio" and the image
is the post's OG card.

Two details that are easy to get wrong and fail quietly:

- **The image must be JPEG.** Instagram's container rejects PNG, and the error
  it returns does not say so. `src/pages/og/[...slug].jpg.ts` exists only for
  this: the same card, re-encoded. `og:image` on the site still points at the
  PNG.
- **The container is created and published in two calls.** Between them it has
  to finish processing, so the workflow waits, reads `status_code`, and only
  publishes on `FINISHED`. A container that never finishes routes to the alert
  rather than to a green run.

#### What you have to set up first

This needs a Meta app and a Page, and none of it can be done from here.

1. Create the Facebook Page and the Instagram account. The Instagram account
   must be a **Business or Creator** account, and it must be **linked to the
   Page** from the Page's settings. A personal Instagram account cannot be
   posted to by any API.
2. At [developers.facebook.com](https://developers.facebook.com), create an app
   of type **Business**, and add the **Instagram Graph API** and **Facebook
   Login for Business** products.
3. In the Graph API Explorer, select the app and request these permissions:
   `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`,
   `instagram_basic`, `instagram_content_publish`.
4. Generate a user token, then exchange it for a **long-lived Page access
   token**. A short-lived token expires in about an hour and the workflow will
   start failing silently-looking failures that are really expiry.
5. Get the two ids: `GET /me/accounts` returns the Page id, and
   `GET /{page-id}?fields=instagram_business_account` returns the Instagram
   user id.

#### Environment variables

Add these in Coolify on the n8n service, then redeploy. Never put a token in
the workflow JSON.

| Variable            | What it is                        |
| ------------------- | --------------------------------- |
| `META_PAGE_ID`      | The Facebook Page id              |
| `META_IG_USER_ID`   | The Instagram business account id |
| `META_ACCESS_TOKEN` | The long-lived Page access token  |

#### Before you activate it

Run it once by hand with the RSS trigger pinned to a single item, and check the
post appears on both. The workflow has no retry and no undo: a bad caption is
published, not queued.

The token is the thing that will break this. Long-lived Page tokens last about
60 days and then stop working. The verification step catches it, because an
expired token returns a response with no `id`, and you get the email.

### 07 — hero images from ChatGPT

Every morning: asks the site's own MCP server which posts exist, reads each
one, takes the first published post with no `heroImage`, generates an
illustration for it with OpenAI's image API, and attaches it through
`upload_image`, which commits the file and sets `heroImage` and `heroAlt`.
Committing starts a build, so the image is live without anyone opening the
repository. All thirteen published posts currently have no hero.

**One image per run, on purpose.** The node that picks the post runs once per
execution. Images are the only part of this stack that costs money per unit, so
a bad prompt costs one picture rather than thirteen, and the daily schedule
fills the backlog over a fortnight while you watch what comes out.

**The prompt forbids text, interfaces and anything resembling a screenshot.**
This is the important line. A generated picture of an Excel window or a Windows
dialog is a fabricated screenshot, and on a site whose whole claim is that a
person ran the steps, a plausible fake screenshot is the worst thing we could
publish. The illustrations are flat, abstract and wordless by instruction, and
the scene is chosen from a fixed map per pillar so the set looks related.

Generated art is decoration, not evidence. A real screenshot still has to be
captured during a real test, and it belongs in the body, not the hero.

**It fails loudly.** An empty or suspiciously small response throws rather than
uploading a broken hero, and the run only counts as successful if `upload_image`
reports that the hero was set. Anything else emails you.

#### Environment variables for 07

| Variable             | What it is                                  |
| -------------------- | ------------------------------------------- |
| `A2Z_MCP_TOKEN`      | The MCP bearer token, from `~/oracle-free/` |
| `OPENAI_API_KEY`     | A key with access to the images endpoint    |
| `OPENAI_IMAGE_MODEL` | Optional. Defaults to `gpt-image-1`         |

Image generation is billed per image, and the price depends on the model, size
and quality tier you choose. Check OpenAI's current pricing before you activate
this, and run it by hand once to see what one costs you.

### 08 — weekly content scorecard

Monday 07:30: asks the MCP for every post, reads each one, and emails the state
of the corpus. Counts per pillar, how many are tested, how many have a hero,
which posts carry fewer than two internal links, which have no inbound link at
all, which have no FAQ, and which are past their re-test date.

It reads the repository rather than the live site, so it sees drafts and
frontmatter, not just what rendered. Run against the corpus on the day it was
written it reported: 13 live, 3 tested, 0 with a hero, every pillar covered,
no thin-link posts and nothing stale.

Needs `A2Z_MCP_TOKEN` and the SMTP credential. Both are set, and it is active.

### 09 — trends to the Facebook Page

Posts a trending topic to a Facebook Page. It has two ways in and they share
everything downstream:

- **The schedule.** 09:00, 14:00 and 20:00 Asia/Kathmandu, it reads
  `https://trends.google.com/trending/rss?geo=$TRENDS_GEO`, picks one trend
  nobody has posted, and builds the caption from the feed's own words. The
  search term, the headline and the outlet name all come from Google, so no
  step in the schedule path can invent a fact.
- **The webhook.** `POST /webhook/muse-facebook-post` takes a caption that Muse
  (or anything else holding the secret) has already written, and publishes it.

Both land on the same Graph API call, the same check that the post really
appeared, and the same failure email.

What the picker refuses, so the Page stays worth following:

| Skipped when                                                    | Why                                                                                 |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| No news article attached to the trend                           | There would be nothing to say and nothing to link                                   |
| The term or the lead headline reads as grief, crime or disaster | "It is trending" is not a reason to post a death notice between two cricket updates |
| The term was posted in the last `TRENDS_COOLDOWN_DAYS` days     | Otherwise the same story goes out every run for as long as it keeps trending        |
| A word in `TRENDS_BLOCKLIST` matches                            | Anything the Page should stay out of                                                |

Only the term and the **lead** headline are screened, not all three articles.
Screening all of them rejected an anime finale for the words "Thousand-Year
Blood War" and a markets story for "Trade War Rout", neither of which would
have appeared in the caption.

A trend is recorded as posted **after** the Page confirms it, never before, so
a failed run leaves it in the pool instead of silently dropping it. Facebook
answers `200` with an error object in the body, so the status code alone is not
treated as proof: the post counts as published only when a post id comes back.

Variables: `TRENDS_GEO` (`NP`), `TRENDS_PLACE` (`Nepal`),
`TRENDS_COOLDOWN_DAYS` (`14`), `TRENDS_BLOCKLIST` (empty),
`MUSE_WEBHOOK_SECRET`, `META_PAGE_ID`, `META_ACCESS_TOKEN`.

It is **inactive** until `META_PAGE_ID` and `META_ACCESS_TOKEN` hold a real
Page id and a Page access token with `pages_manage_posts`. Activating it before
then would email a failure three times a day.

The caption carries the article link, so Facebook renders the publisher's own
preview card. It does not re-upload the publisher's photo, which would be
someone else's image on a monetised Page.

### 10 — Muse: news to an illustrated post

Muse does the watching and the writing. This workflow turns what it sends into
an illustrated photo post on the Facebook Page.

```
Muse  ->  POST /webhook/muse-illustrated-post  ->  image  ->  Page photo post
```

The body needs `message`, and **one** of these two:

| Field          | What happens                                                    |
| -------------- | --------------------------------------------------------------- |
| `image_prompt` | n8n calls `POST /v1/images/generations` and generates the image |
| `image_base64` | Muse generated it already; n8n uploads what it was given        |

`link`, `term` and `source` are optional. A photo post does not render a link
preview card the way a feed post does, so when `link` is present it is appended
to the caption text instead.

```bash
curl -X POST https://n8n.apps.antbytelabs.com/webhook/muse-illustrated-post \
  -H "x-muse-secret: $MUSE_WEBHOOK_SECRET" \
  -H 'Content-Type: application/json' \
  -d '{
    "message": "The caption Muse wrote.",
    "image_prompt": "a stadium at dusk, seen from the stands",
    "link": "https://example.com/story",
    "term": "the topic, used only in the failure email"
  }'
```

The image always arrives as base64 and there is no way around that:
`response_format` is deprecated and unsupported for the GPT image models, which
always return base64, and the DALL·E models that could return a hosted URL are
retired. A **Convert to File** node turns it into a real `image/jpeg`, which is
then uploaded to `POST /{page-id}/photos` as multipart `source`.

Images are generated as JPEG at 1024x1024, square so it works on both networks,
and `quality` defaults to `medium` through `OPENAI_IMAGE_QUALITY`. The prompt
wraps whatever Muse sends with a house style and a hard instruction against
text, logos, interface chrome and identifiable people, because image models
render text badly and a garbled word on a monetised Page is worse than no
illustration.

The gate refuses a request with no `message`, with neither image field, with a
non-https `link`, with an `image_base64` that is not base64 or decodes to under
2 KB, and any request whose secret does not match. It fails closed.

Variables: `OPENAI_API_KEY`, `OPENAI_IMAGE_MODEL` (`gpt-image-1`),
`OPENAI_IMAGE_QUALITY` (`medium`), `MUSE_WEBHOOK_SECRET`, `META_PAGE_ID`,
`META_ACCESS_TOKEN`.

It is **inactive**, and needs an OpenAI key for the `image_prompt` route and a
Page token for either route. Every generated image is a paid OpenAI call, so
the cost scales with how often Muse fires.

#### What was verified, and what was not

The `image_base64` route was run end to end through the live instance with a
real 15,156-byte JPEG. Convert to File produced `image/jpeg`, `post.jpg`,
15.2 kB, and the multipart upload reached Facebook, which rejected it with
`(#100) 0 does not resolve to a valid user ID`: the empty `META_PAGE_ID`. A
malformed upload returns `(#324) Missing or invalid image file` instead, so the
file reached Facebook intact and only the Page id was missing.

The `image_prompt` route has **not** been run. There is no OpenAI key on the
service, so the generation call itself is untested here.

#### Instagram is not wired up

An Instagram container takes `image_url` and will not accept an uploaded file,
so publishing a generated image there needs the image on a public URL first.
Nothing here hosts one: there is no R2 bucket on the account, and the site is
static assets on a Worker.

Two ways to add it, neither built:

- Read the Facebook photo's own CDN URL back from the Graph API after the post
  lands, and hand that to the Instagram container. No new infrastructure.
- Put the image in an R2 bucket with a public URL. More moving parts, and the
  URL does not expire.

## Connecting Muse, or anything else, to this n8n

Muse needs two things, and both already exist:

| Field    | Value                                                                          |
| -------- | ------------------------------------------------------------------------------ |
| Base URL | `https://n8n.apps.antbytelabs.com` (some connectors want `/api/v1` on the end) |
| API key  | In `~/oracle-free/n8n-api-key`. It has no expiry                               |

The key is a full-access public-API key: anything holding it can read, edit,
create and delete every workflow on the instance. n8n has no scope system for
these, so there is no narrower key to hand out. If Muse should only be able to
publish a post and nothing else, give it the **webhook** and
`MUSE_WEBHOOK_SECRET` instead of the API key, and keep the key for yourself.

The webhook is the narrow door:

```bash
curl -X POST https://n8n.apps.antbytelabs.com/webhook/muse-facebook-post \
  -H "x-muse-secret: $MUSE_WEBHOOK_SECRET" \
  -H 'Content-Type: application/json' \
  -d '{"message":"The caption, already written.","link":"https://example.com/article"}'
```

`message` is required. `link` is optional and must be https. `term` and
`source` are accepted and only used in the failure email. It fails closed: if
`MUSE_WEBHOOK_SECRET` is not set on the service, every call is refused rather
than accepted unsigned.

## Env access had to be unblocked

Coolify's n8n template sets `N8N_BLOCK_ENV_ACCESS_IN_NODE` to `true` by
default, which makes every `$env.` reference in a node return nothing. Three of
these workflows read their credentials that way, so they would have failed
quietly rather than loudly. It is now `false` on the service.

The trade: any workflow on this instance can read the service's environment.
That is acceptable here because one person owns every workflow on it. If that
ever stops being true, move the tokens into n8n credentials of type Header Auth
and set the flag back.
