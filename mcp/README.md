# A2Z Skills MCP server

Edits the site from any AI chat. Create a post, upload a hero image, publish it,
check what is live — without opening the repository.

- **Endpoint:** `https://a2z-skills-mcp.a2zskills.workers.dev`
- **Auth:** `Authorization: Bearer <token>` on every request. Without it the
  endpoint answers 401 and nothing else.
- **Token:** `~/oracle-free/a2z-mcp-token.txt`, mode 600. Not in this repo.

## How it works

Every tool commits to `AntByteLabs/a2z-skills` through the GitHub Contents API.
The repository stays the source of truth, so each change from a chat has an
author, a message and a revert, and the same validator rules apply. Nothing
writes to the live Worker directly.

```
AI chat  →  MCP Worker  →  GitHub commit  →  Workers build  →  a2zskillsewa.com
```

## Connect it

**Claude Code**

```bash
claude mcp add --transport http a2z-skills https://a2z-skills-mcp.a2zskills.workers.dev \
  --header "Authorization: Bearer $(awk '/^header/{print $4}' ~/oracle-free/a2z-mcp-token.txt)"
```

**claude.ai** — Settings, Connectors, Add custom connector, paste the URL and
the same `Authorization` header.

## The tools

| Tool                                 | What it does                                                               |
| ------------------------------------ | -------------------------------------------------------------------------- |
| `list_posts`                         | Every post with title, pillar, type, draft state, tested date              |
| `get_post`                           | One post's frontmatter and body, with its validation result                |
| `create_post`                        | New post as a draft, slug derived from the keyword, blueprint headings     |
| `update_post`                        | Merge frontmatter fields, replace or append the body                       |
| `publish_post`                       | `draft: false` and start a build. **Refuses a post that fails validation** |
| `unpublish_post`                     | Back to `draft: true`                                                      |
| `upload_image`                       | Attach an image from base64 or an https URL and set it as the hero         |
| `delete_post`                        | Remove a post file                                                         |
| `list_taxonomy`                      | The pillars, types and author ids a post can use                           |
| `site_status`                        | Whether the live site answers, and how many posts are published            |
| `deploy`                             | Build and publish the current `main`                                       |
| `read_repo_file` / `write_repo_file` | Anything else: redirects, authors, pillars                                 |

## Uploading an image from a chat

Attach the image, then ask for it to be uploaded. The tool takes raw base64 or
a public https URL, checks the magic numbers rather than trusting the
Content-Type, caps the file at 10 MB, commits it beside the post and sets
`heroImage` and `heroAlt` in the same commit. Astro produces the AVIF and WebP
sizes at build, so the raw file is the right thing to commit.

## What it will not do

`publish_post` runs the same checks the repository validator runs and refuses a
post that fails them: a missing or wrongly sized description, a missing short
answer, thin prose, a leftover TODO, or a how-to, fix or review with no
`testedOn` record. That last one is the site's whole premise, so it is enforced
here as well as in the build.

## Deploying

**Nothing needs calling.** Cloudflare Workers Builds watches `main`, and every
tool here commits to `main`, so a change is built and published on its own,
usually inside two minutes.

```
chat → MCP tool → commit to main → Workers build → a2zskillsewa.com
```

Verified end to end on 26 October 2026: an `update_post` call produced commit
`90b3fce`, which Cloudflare picked up as a `push_event` and built without
anything else being triggered.

The `deploy` tool reports that, and links the build log. It can also force a
rebuild with no commit behind it, which needs a Cloudflare API token set as
`CF_API_TOKEN` on this Worker. That token has to be made by hand at
[dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens):
account-owned tokens created through `/accounts/{id}/tokens` are **not** valid
deploy credentials, which is a trap worth knowing. A build using one fails with
_"The build token selected for this build has been deleted or rolled"_, which
does not describe the real problem at all.

### The build setup

| Setting        | Value                    |
| -------------- | ------------------------ |
| Repository     | `AntByteLabs/a2z-skills` |
| Branch         | `main`                   |
| Root directory | `/`                      |
| Build command  | `npm run build`          |
| Deploy command | `npx wrangler deploy`    |
| Build caching  | on                       |

The automatic build runs content validation, Astro checks, Pagefind, the asset
count and the transfer-size budget. The local pre-push check also runs lint,
Worker types, regression tests, a complete built-site link crawl and browser
tests. A failed content validator stops the automatic build.

## Known edges

- `delete_post` removes the post file but leaves images in the folder. That is
  right when a post is being rewritten and wrong when a test is being cleaned
  up; remove the folder by hand in that case.
- Commits go straight to `main`. There is no review step by design: the
  validation gate replaces it.
- A chat can publish. The gate above is what stands between a chat and the live
  site, so do not weaken it without replacing it with something else.

## Local development

```bash
npx wrangler dev --config mcp/wrangler.json --port 8799
```

The compatibility date must not be in the future, or the runtime refuses to
start the Worker with a validation error that does not explain itself.

## Article write checks

Create, update and publish tools validate metadata, prose and repository references
before writing. A bad edit to an already published post is refused before the
GitHub commit. Generic file writes reject article paths so they cannot skip these
checks. Drafts can be incomplete, but publication requires a valid test record for
a procedure and the published-content checks.
