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
