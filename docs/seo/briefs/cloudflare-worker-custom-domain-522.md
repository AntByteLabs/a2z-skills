# Worker-specific 522: separate self-fetch from origin and route failures

Status: prepared for a human test; unpublished.
Primary query: Cloudflare Worker custom domain 522
Candidate route: /cloudflare-worker-custom-domain-522/
Existing parent: /cloudflare-workers-custom-domain-not-working/

## Evidence required

The named tester must supply the date, product versions, device/deployment,
starting state, exact observed output and final result. Record failed attempts
as well as the working result. No test has been claimed for this brief.

- [ ] Use a disposable Worker and hostname with no production dependencies.
- [ ] Record a minimal self-fetch case and its observed response.
- [ ] Demonstrate the repaired request path and distinguish Workers from Pages and conventional origins.

## Article outline

1. State the observed symptom and the scope of the tested case.
2. Give the shortest supported answer, followed by a diagnostic table.
3. Record prerequisites and the verified actions in order.
4. Show the outcome check and the failures encountered.
5. Explain the limits, answer real follow-up questions and cite the sources.

## Source and linking

Use [the primary reference](https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-5xx-errors/error-522/) to research behaviour. Documentation alone
is not a record that the procedure was followed. Link the finished article from
/cloudflare-workers-custom-domain-not-working/ and its topic hub, and add relevant return links in the same change.

A generic 522 is not proof of self-fetch. Avoid destructive DNS replacements and do not change the production VPS.

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
