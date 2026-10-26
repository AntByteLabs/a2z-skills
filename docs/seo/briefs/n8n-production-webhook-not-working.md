# Production webhooks: distinguish test URL, published state and HTTP method

Status: basic test/production URL diagnosis is published at [/n8n-webhook-not-working/](/n8n-webhook-not-working/). The owner confirmed Ronit completed the review on 26 October 2026. Further outcome checks below remain an extension of that article, not a second page for the same intent.
Primary query: n8n production webhook not working
Canonical route: /n8n-webhook-not-working/
Existing parent: /self-host-n8n-coolify/

## Evidence required

The named tester must supply the date, product versions, device/deployment,
starting state, exact observed output and final result. Record failed attempts
as well as the working result. The published article records the two observed 404 responses; the remaining checks below need their own evidence.

- [ ] Record a disposable workflow's behaviour before and after publication.
- [ ] Compare the actual test and production endpoints with the same HTTP method and payload.
- [ ] Verify the external request and the destination outcome; a 200 response alone is insufficient.

## Article outline

1. State the observed symptom and the scope of the tested case.
2. Give the shortest supported answer, followed by a diagnostic table.
3. Record prerequisites and the verified actions in order.
4. Show the outcome check and the failures encountered.
5. Explain the limits, answer real follow-up questions and cite the sources.

## Source and linking

Use [the primary reference](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/workflow-development/) to research behaviour. Documentation alone
is not a record that the procedure was followed. Link the finished article from
/self-host-n8n-coolify/ and its topic hub, and add relevant return links in the same change.

Keep this guide about endpoint registration and request handling. Wrong external host/protocol belongs in the Coolify URL guide.

## Publication check

- [ ] Human test record complete and reviewed.
- [ ] Any screenshots, logs or downloads contain no credentials or private data.
- [ ] Humanizer review complete.
- [ ] Frontmatter includes the real testedOn record; no invented versions or dates.
- [ ] npm run check passes and the page has been read at phone width.
- [ ] Publication is recorded in the keyword map and implementation status.

Any test involving ubuntu@161.118.175.122 must first run the mandatory rules and
oracle-guard command from the workspace instructions. No test may add paid
resources or use the production VPS without a specific request.
