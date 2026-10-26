# Schedule diagnosis: publication, timezone and observed executions

Status: prepared for a human test; unpublished.
Primary query: n8n schedule trigger not running
Candidate route: /n8n-schedule-trigger-not-running/
Existing parent: /automations-failing-silently/

## Evidence required

The named tester must supply the date, product versions, device/deployment,
starting state, exact observed output and final result. Record failed attempts
as well as the working result. No test has been claimed for this brief.

- [ ] Record workflow timezone, instance timezone and intended next execution.
- [ ] Observe a short disposable schedule while the service remains running.
- [ ] Distinguish wrong-time executions from missing executions and document the actual published state.

## Article outline

1. State the observed symptom and the scope of the tested case.
2. Give the shortest supported answer, followed by a diagnostic table.
3. Record prerequisites and the verified actions in order.
4. Show the outcome check and the failures encountered.
5. Explain the limits, answer real follow-up questions and cite the sources.

## Source and linking

Use [the primary reference](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.scheduletrigger/common-issues/) to research behaviour. Documentation alone
is not a record that the procedure was followed. Link the finished article from
/automations-failing-silently/ and its topic hub, and add relevant return links in the same change.

Do not use a production workflow to test schedules. Do not promise missed runs are backfilled without a verified case.

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
