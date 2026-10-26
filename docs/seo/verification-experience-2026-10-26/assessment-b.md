# Assessment B: detector and browser evidence

Completed 26 October 2026 by isolated agent `/root/design_detector`. Read-only assessment of `/Users/dev./a2z-skills-experience/src` and the published site. Assessment A was not read. No product source was edited, no form was submitted, and no D1, Oracle or production server access was used. Existing `.impeccable/critique/design-evidence` artifacts belong to the parallel assessment and were not read. Browser and temporary overlay server have been stopped.

## Scope and method

Read project AGENTS.md and CLAUDE.md. No critique ignore file existed at the initial scan. `src` contains 94 files, so no narrowing was necessary.

Source command: `/Users/dev./.claude/skills/impeccable/scripts/impeccable detect --json src` from the project directory. Exit 0; output `[]`. This is a static source result and does not establish that the rendered interface is issue-free.

No native browser tool is exposed. Used a separate headless Playwright Chromium browser, fresh pages, live URLs and desktop 1440×1000 / mobile 390×844 viewports. Inspected homepage, `/topics/automation/`, and `/self-host-n8n-coolify/`; all returned HTTP 200. Screenshots were visually inspected. All six page/viewport combinations had document scrollWidth equal to viewport width. No page errors were recorded. The hidden horizontal content discussed below is inside intentional scroll containers, rather than document overflow.

## Detector results

After the source scan, ran rendered URL scans on the same three pages at each viewport. Each scan returned exit 2 (findings, not operational failure).

| Scan | Primary findings | Advisories | Rules |
| --- | ---: | ---: | --- |
| Source `src` | 0 | 0 | none |
| Desktop 1440×1000 | 5 | 2 | radial-halo 1; line-length 3; first-viewport-column-overflow 1; straggler 2 advisory |
| Mobile 390×844 | 1 | 3 | radial-halo 1; straggler 3 advisory |

There are 6 primary findings across the two rendered scans, including a duplicate homepage radial-halo finding; 5 advisory findings, at viewport-specific locations. Raw JSON includes full rule names, descriptions, URLs and selectors. Rendered locations have line 0 because there is no source line mapping.

Desktop locations:

- Homepage `body`: `radial-halo`, pale #e5f1ff background wash.
- Automation hub `div.prose.mt-3 > p:nth-of-type(1)`: `line-length`, approximately 87 characters on 2 of 3 rendered lines.
- Article `div.prose.prose-sm > p:nth-of-type(3)`: `line-length`, approximately 88 characters on 2 of 6 rendered lines, in the testing-error material.
- Article `div.py-3\.5:nth-of-type(2) > dd.mt-1.text-ink-soft`: `line-length`, approximately 86 characters on 2 of 3 FAQ-answer lines.
- Article `#main > div.shell.grid`: `first-viewport-column-overflow`, long reading column alongside short sidebar.
- Article FAQ answer selectors `div.py-3\.5:nth-of-type(1|2) > dd.mt-1.text-ink-soft`: advisory `straggler` for final words “not.” and “separately.”

Mobile locations:

- Homepage `body`: same `radial-halo` finding.
- Article `div.flex.items-baseline:nth-of-type(4) > dd`: advisory `straggler`, test-device line ends with “GB”.
- Article FAQ answer selectors `div.py-3\.5:nth-of-type(1|3) > dd.mt-1.text-ink-soft`: advisory `straggler` for “not.” and “field.”

## Interpretation and false positives

The radial-halo finding describes a glow “on a dark page”, but the observed page is light, with a quiet pale-blue-to-paper hero tint. This is a detector misclassification, and is not sufficient evidence to remove an existing brand treatment. Relevant source: `src/styles/global.css:305`.

The article column-overflow finding is a contextual false positive: an editorial article is expected to extend below a compact topic/TOC sidebar. Balancing those column heights would make reading worse. Keep the useful desktop TOC unless Assessment A independently identifies a real problem.

The three desktop line-length findings are credible minor typography opportunities, rather than blockers. Constrain the hub introduction and secondary article/FAQ copy with existing measure tokens if visual review agrees. Advisory stragglers are low priority. `p, li` already use `text-wrap: pretty` at `src/styles/global.css:134`; FAQ `dd` and test-record values do not receive that rule. Extending to those specific text blocks may help without editing tested facts.

## Browser evidence worth carrying into synthesis

1. **[P2] Mobile navigation buries the target audience's topics.** At 390px the topic row has scrollWidth 726px, clientWidth 390px, scrollLeft 0. “Websites & Hosting” starts at x444 and “Automation” at x602. On the automation hub the active topic is outside the initial viewport. A tiny cut-off AI Tools chip suggests continuation, but there is no scrollbar. This is functional horizontal scrolling, not a broken link or document overflow. Consider a visible All topics entry, an explicit overflow cue, or bringing the active item into view. Preserve access to all six topics. Source: `src/components/site/Header.astro:65`.

2. **[P2] Mobile reading toolbar hides text-size and Top controls.** At 390px the toolbar is 366px wide with 452px scroll content. “Larger text” begins at x384.7 and “Top” at x423.1; neither is initially visible inside the toolbar. Its smaller controls are 32×24px; header theme toggle is 38×30px and mobile header search is 40×28px. These sizes fall below the common 44px touch-target recommendation, although they are not automatically WCAG failures. Keyboard focus on Larger text scrolls it into view (scrollLeft 88), so do not call it keyboard-inaccessible. Consider grouping optional controls behind an explicit menu or retaining only the main reading action until opened. Source: `src/components/post/ReaderBar.astro:17`.

3. **[P2] Topic-first discovery is far down the homepage.** The homepage presents all 12 latest guides before the six topic cards. In the captured mobile layout the tested n8n guide is the tenth card, and topic browsing follows the full list. This makes a visitor seeking automation/hosting work through a long general-interest feed unless they recognise the horizontal header affordance or search. Reordering existing content or adding a compact task/topic route near search could improve discovery without new scripts. Source: `src/pages/index.astro:71`.

4. **[P2] Footer makes a weekly delivery promise while saying delivery is inactive.** The footer title is “One tested guide a week”; the shared form says “Email delivery is not active yet.” A reader cannot tell whether Subscribe starts a weekly email or only stores an address. The inline article form is more honest (“Join the guide notification list”). Do not enable email or change backend behaviour as a visual fix; align the visible promise with its current operation. Source: `src/components/site/Footer.astro:34`, `src/components/site/NewsletterForm.astro:70`. No subscription was tested or submitted.

Useful strengths confirmed by browser evidence: clear article short answer and specific test record before instructions; visible breadcrumbs and a labelled TOC; consistent paper/ink/blue branding; article and hub titles plainly identify n8n/Coolify and troubleshooting. The automation hub already groups two posts by task/type with a Start here path, and is substantially easier to scan than the broad homepage feed.

## Overlay protocol and limitations

Mutable injection preflight succeeded: document.title changed and was restored, and an appended inline script executed and was removed. Started the Impeccable live-server in `/tmp/a2z-ui-detector`, not in the repository, then attempted `http://localhost:8400/detect.js` injection on all six fresh live page/viewport views.

All six external injection attempts failed. Chromium reported: “Access to script ... from origin https://a2zskillsewa.com has been blocked by CORS policy: Permission was denied for this request to access the loopback address space.” Therefore the detector did not execute inside those pages; there are no detector console findings from the overlay. There is **no reliable user-visible overlay** and no `[Human]` tab was presented. The harness exposes no browser presentation capability, and this was a headless browser. Fallback evidence is the rendered URL detector JSON, full-page and viewport screenshots, and measured DOM/control bounds.

Stopped the temporary server with `impeccable live-server stop --keep-inject`; the recorded output confirms it stopped. There was never an injected project script tag. No local product server was started because the live deployed pages were available and allowed a fully read-only review.

## Evidence files

- `cli.json`: source scan output.
- `rendered-desktop.json`, `rendered-mobile.json`: complete rendered findings with rules, counts derivable without rerunning, URLs and selectors.
- `summary.json`: counts, rules, viewport and exit-code summary.
- `browser.json`: six page captures' metadata, full text, target geometry, console logs and injection errors.
- `preflight.json`: successful mutable injection preflight.
- `controls.json`: mobile nav/toolbar overflow measurement and successful keyboard focus recovery.
- `home-{desktop,mobile}.png`, `hub-{desktop,mobile}.png`, `article-{desktop,mobile}.png`: full-page captures.
- `article-mobile-viewport.png`, `hub-mobile-viewport.png`: initial mobile viewport screenshots.
- `server-stop.txt`: temporary overlay server stop confirmation.
- `inspect.mjs`, `controls.mjs`: reproducible read-only browser evidence scripts.

Questions skipped: Assessment B is an isolated evidence collection subtask; the parent owns synthesis and any user questions.
