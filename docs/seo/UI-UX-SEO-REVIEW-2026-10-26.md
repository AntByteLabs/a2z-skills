Method: dual-agent (A: /root/design_assessment · B: /root/design_detector)

# Project review and improvements

Reviewed 26 October 2026, starting at commit 35b75f4. Audience: global English
readers looking for automation, hosting and troubleshooting help. Mode: Read.
The existing Bricolage headings, Literata article text, paper/ink palette and
short-answer/test-record structure remain the design direction.

## Critique

The reading experience has a clear identity. The discovery experience needed
work: twelve equal-weight cards hid the two tested procedures near the bottom,
and mobile navigation hid Automation and Hosting beyond a sideways scroll.
More serious defects blocked normal mouse/touch clicks and made dark search
hard to read. A perfect Lighthouse score had not caught these interaction bugs.

Independent assessment A scored the original experience 25/40. This is a
heuristic opinion, not a traffic measurement or ranking score. All ten
heuristics applied; none was omitted.

| Heuristic | Before /4 | Main finding |
| --- | ---: | --- |
| System status | 3 | Useful dates and progress; some controls do not expose current state. |
| Familiar language | 3 | Clear problem titles; raw labels such as ai & tools. |
| User control | 2 | Useful navigation; optional reader controls hidden sideways. |
| Consistency | 2 | Coherent article design; search ignores the dark theme. |
| Error prevention | 2 | Card overlays cause unintended clicks. |
| Recognition | 2 | Target topics and useful result excerpts are hard to find. |
| Efficiency | 3 | Search, copy, listening and size controls exist. |
| Minimalist design | 3 | Strong reading measure; too much duplicate discovery UI. |
| Recovery | 2 | Search has no practical empty-result route or reliable retry button. |
| Help | 3 | Real sources and testing errors; search includes interface furniture. |
| Total | 25/40 | Significant functional fixes needed. |

Cognitive load was moderate: three failures out of seven checks. Repeated
homepage choices, an overflowing reader toolbar and weak prioritisation were
the problems. First-time visitors struggled to choose an entry point. Mobile
readers lost section headings under the two-row header. Readers using dark
mode could barely read search results. The strongest part of the journey was
the article answer and its test record; contradictory footer claims weakened
the ending.

## Priority findings and changes

1. P0: A stretched article link had no positioned containing block. Its
   pseudo-element covered the viewport and intercepted homepage search and
   neighbouring links. Cards now contain their own click area. Browser tests
   click card whitespace and the actual search field.
2. P1: Pagefind used fixed default colours in dark mode. Search now inherits
   the site tokens, including highlights, input and result text. Browser tests
   measure contrast under system dark, manual dark and manual light choices.
3. P1: Search indexed share controls, feedback and related cards. Those areas,
   bylines and contents navigation are now excluded; article content, test
   records and FAQ answers remain searchable. Results show one entry per
   matching article. A failed bundle has a tested Retry search action; topics
   remain available for empty results and without JavaScript.
4. P1: The two tested procedures were buried. They now appear beside the main
   search on desktop and directly below it on phones. Topic links precede the
   full library. Readers can filter by topic and tested guide/explainer type,
   see a result count and clear an empty selection.
5. P1: The footer promised weekly delivery while the form said delivery was
   inactive. It now describes guide notifications and distinguishes tested
   procedures from sourced explainers. Backend behaviour did not change.
6. P2: Mobile navigation and reader controls required hidden horizontal
   scrolling. A native expandable menu exposes all six topics. Optional speed
   and text-size settings sit behind Options, with current size and limits.
   Controls remain usable on narrow phones and preserve size preferences.
7. P2: Both article contents lists reused an ID and only one received active
   section updates. IDs are unique, both lists share current-location state,
   mobile contents starts collapsed, and anchors clear the one-row header.
8. P2: Two-article hubs repeated each destination three times. Introductory
   task links and article groups remain; the extra Start here list appears
   once a hub has more than three articles. Card labels use the real topic
   names. Single-article groups use the available width.

## SEO decisions

The full catalogue is rendered as ordinary HTML anchors before JavaScript
runs. The filters only hide/show existing entries and do not create query
URLs, extra archive pages or an indexing dependency. The home page, topic
index and topic hubs describe their visible collections with ItemList data.
This describes the content; it is not a promise of a special search result.
[Google link guidance](https://developers.google.com/search/docs/crawling-indexing/links-crawlable),
[Schema.org ItemList](https://schema.org/ItemList).

Homepage metadata now names automation and hosting and accurately describes
both tested fixes and sourced explanations. Article URLs, dates, canonical
rules, noindex archives, sitemap membership and factual test records remain
unchanged. Literata is preloaded on article pages rather than every utility
and discovery page. No font or UI dependency was added.

The largest remaining SEO constraint is the supply of useful, original
articles in the chosen subject area. Twelve posts across six topics provide
little depth in any one topic. The existing keyword queue prioritises n8n,
Coolify and Cloudflare problems. Publish those guides after a person supplies
test records, then use actual Search Console queries and indexing reports to
choose follow-ups. Extra markup and a new layout cannot guarantee 10,000 clicks.
[Google SEO starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide).

The handoff reports two normal redirect exclusions and one old tag duplicate
in Search Console. That report was not independently inspected in the owner's
account. Existing tag noindex remains; Validate Fix is an account action. No
new technical workaround was inferred from those three exclusions.

## Detector and visual evidence

Assessment A finished before assessment B entered synthesis. A captured four
surfaces at 375, 768 and 1280 pixels and representative dark states. B used a
separate browser and source/rendered scans. The source detector returned no
findings. Rendered scans returned six primary findings and five advisories,
including a repeated pale hero tint finding misclassified as a dark glow and
a long article beside a short sidebar. Those two findings were contextual
false positives. Long secondary text was constrained; the useful sidebar stayed.

Overlay injection was attempted, but Chromium blocked the remote page's access
to a loopback script. No user-visible overlay was available. Both assessment
browsers and the temporary overlay server were closed. The independent
[assessment A](design-assessment-a-2026-10-26.md) and
[assessment B](verification-experience-2026-10-26/assessment-b.md) retain the
original observations and limitations.

Local screenshots are stored under `.impeccable/critique/design-evidence/`
(before) and `.impeccable/critique/after/` (after). After captures cover homepage,
automation hub, article and populated search at all three widths, plus mobile
menu, reading options and manual/system dark search. The twelve light-mode
captures have no document overflow. Images remain local review artifacts.

## Validation and publication

Final check, Lighthouse and production results are recorded in
[verification](verification-experience-2026-10-26/). Form tests use mocked
submissions; this review did not add production signup or feedback records.

## Remaining work

- Supply private Search Console query/performance and indexing data. Record a
  baseline and follow the existing [measurement plan](MEASUREMENT.md).
- Supply the public Web Analytics beacon token or suitable account access.
- Test the queued procedures before publication; add real author profile links
  and permissioned photographs when the authors provide them.
- The DNS prose and caching-cluster link mentioned in the handoff remain as
  they were. Both links have a possible editorial rationale; a link count
  cannot settle whether cross-topic caching or the deployment path best serves
  that paragraph. This pass did not resolve that disagreement by rewriting it.
- Minor improvements outside this pass include cancellation of a negative
  feedback note and navigable links within the article's diagnostic tables.
  These are separate from the corrected discovery and search defects.

Questions skipped: the user already requested implementation. The audience,
priority, existing brand and shipping constraints were supplied. Missing account
access and human test evidence were not fabricated.
