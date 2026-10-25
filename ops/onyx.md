# Onyx — why it is not on the Oracle server

Decided 25 October 2026. Onyx (`onyx-dot-app/onyx`) is run on **Onyx Cloud's
free tier**, not self-hosted here.

## What the investigation found

Onyx ships two deployment modes, and neither fits the Always Free box:

**Lite** (`docker-compose.onyx-lite.yml`) is an overlay that moves the model
servers, OpenSearch, Redis, the object store and the background worker to
inactive profiles, sets `DISABLE_VECTOR_DB=true`, and uses Postgres for caching
and file storage. Its own header says it plainly: _"connectors and RAG search are
disabled"_. That leaves a chat UI — about 700 MB of Postgres, API and web server
for no document search, which is the only reason we wanted Onyx.

**Standard** is the useful one, and needs OpenSearch plus two PyTorch model
servers. On a 12 GB box already running Coolify, six demo sites, Uptime Kuma,
Umami, Gitea, coturn and now n8n, that is an OOM waiting to happen. The server
has to stay at 2 OCPU / 12 GB to stay free, so there is no headroom to buy.

The images are multi-arch (`linux/amd64`, `linux/arm64`), so arm64 was not the
blocker — resources and usefulness were.

## What to do instead

Sign in at [cloud.onyx.app](https://cloud.onyx.app) and add a **web connector**
pointed at `https://a2zskillsewa.com/sitemap-index.xml`. That indexes every
published guide and gives the thing we actually wanted: asking questions across
our own tested content, and spotting where two posts contradict each other.

Re-index after a batch of posts ships. The sitemap only lists live, indexable
pages, so drafts never reach it.

## If it is ever self-hosted

Put it on the production VPS (217.216.59.179), which has the memory, not on the
free box — and as a planned, one-service-at-a-time job, at a quiet hour, the way
the Oracle rules describe for moving anything there.
