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

The `deploy` tool starts a **Cloudflare Workers build**, which needs connecting
once: Cloudflare dashboard, Workers & Pages, `a2z-skills`, Settings, Builds,
connect `AntByteLabs/a2z-skills`. Then set three secrets on this Worker:

```bash
npx wrangler secret put CF_API_TOKEN     --config mcp/wrangler.json
npx wrangler secret put CF_ACCOUNT_ID    --config mcp/wrangler.json
npx wrangler secret put CF_BUILD_TRIGGER --config mcp/wrangler.json
```

Until then `deploy` says exactly that, and `npm run deploy` from the repository
publishes as usual.

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
