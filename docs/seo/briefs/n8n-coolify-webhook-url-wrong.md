# Coolify external URL: compare domain, generated settings and actual links

Status: prepared for a human test; unpublished.
Primary query: n8n Coolify webhook URL wrong
Candidate route: /n8n-coolify-webhook-url-wrong/
Existing parent: /self-host-n8n-coolify/

## Evidence required

The named tester must supply the date, product versions, device/deployment,
starting state, exact observed output and final result. Record failed attempts
as well as the working result. No test has been claimed for this brief.

- [ ] Record the exact Coolify template, n8n and proxy versions.
- [ ] Compare stored service domain, public URL variables and generated webhook URLs.
- [ ] Redeploy the disposable service and record whether the effective values persist.

## Article outline

1. State the observed symptom and the scope of the tested case.
2. Give the shortest supported answer, followed by a diagnostic table.
3. Record prerequisites and the verified actions in order.
4. Show the outcome check and the failures encountered.
5. Explain the limits, answer real follow-up questions and cite the sources.

## Source and linking

Use [the primary reference](https://docs.n8n.io/hosting/configuration/configuration-examples/webhook-url/) to research behaviour. Documentation alone
is not a record that the procedure was followed. Link the finished article from
/self-host-n8n-coolify/ and its topic hub, and add relevant return links in the same change.

Use the historical SERVICE_FQDN/SERVICE_URL issue as research context, not proof that a current release has the same bug.

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
