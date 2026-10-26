# Independent design assessment A — 26 October 2026

Assessment A only. Independent visual and source review; no detector findings were read. Live target: https://a2zskillsewa.com. Source: `/Users/dev./a2z-skills-experience`, branch `improve/discovery-seo-20261026`, initial HEAD `35b75f4`. This is input to the parent critique, not the completed two-assessment synthesis.

## Design specificity

The article experience feels authored for a practical troubleshooting publication. Bricolage headings, warm paper, restrained blue links, serif reading text, real test records, and the unusually candid “What broke while testing” section give the product character. Preserve those choices. Its strongest visual asset is the contrast between compact sans-serif interface information and comfortable long-form serif prose.

The discovery experience is less specific: twelve identical cards in a date-ordered grid could be a generic software blog. The two tested guides, which prove the brand promise, come tenth and twelfth. Automation and hosting, central to the intended audience, sit behind four broad consumer-tech categories. The opportunity is editorial selection and intent-based entry points, not a new palette or a more elaborate hero.

## Evidence and boundaries

Captured homepage, Websites & Hosting hub, Cloudflare Workers custom-domain article, and populated search (`cloudflare`) at 375, 768, and 1280 pixels. Captured representative dark homepage, article, and search; separately checked empty search and settled article anchor navigation. Evidence: `.impeccable/critique/design-evidence/`. No horizontal document overflow on the twelve principal light-mode captures. All browser contexts were closed; no local server was started.

Source read: page templates, base/article layouts, theme CSS, header/footer, cards, search, TOC, test/answer blocks, newsletter, helpful feedback, and reading toolbar. No real newsletter or feedback submission was sent. Full screen-reader testing, live API failure recovery, speech quality, and formal contrast certification were not performed. Scores involving forms use source inspection plus visible states.

## Heuristics

All ten apply: this is a searchable knowledge product with task-oriented navigation, forms, reading controls, and recovery states, rather than a purely persuasive landing page.

| # | Heuristic | Score /4 | Evidence |
|---|---|---:|---|
| 1 | Visibility of system status | 3 | Breadcrumbs, update/test dates, search count, reading progress and control states help. Submit controls lack a visible sending state; theme button does not expose the selected theme. |
| 2 | Match to the real world | 3 | Error-led article titles and observation-to-section table match the task. Raw taxonomy labels such as `explainer` and `ai & tools` are less natural. |
| 3 | User control and freedom | 2 | Search Clear, collapsible TOC, home links and reversible reader controls work. “No, still broken” replaces choices with a note form with no cancel/back control. |
| 4 | Consistency and standards | 2 | Main templates are coherent. Pagefind results use an unrelated visual treatment, particularly in dark mode; card click regions do not follow the visible boundaries. |
| 5 | Error prevention | 2 | Email input constraints and copied commands help. The card overlay itself produces accidental destinations; newsletter promises contradict delivery status. |
| 6 | Recognition rather than recall | 2 | Breadcrumbs and TOC reduce memory demand. Important categories are beyond the visible mobile rail; search excerpts include unrelated UI text rather than a clean article summary. |
| 7 | Flexibility and efficiency | 3 | Search shortcut, deep links, copy code, text size, listening and auto-scroll offer useful alternatives. Several reader controls are offscreen on mobile. |
| 8 | Aesthetic and minimalist design | 3 | Strong reading measure and calm hierarchy. Repeated homepage cards and multiple hub links to each of two articles consume attention without adding decisions. |
| 9 | Error recovery | 2 | Search-load retry text and feedback retry exist in source. Empty search only says “No results”; newsletter failure is nonspecific. |
| 10 | Help and documentation | 3 | Search, sources, FAQ, test record and real failed attempts are useful help. Search indexes peripheral UI, and diagnostic table labels are plain text rather than section links. |
| | **Total** | **25/40** | **Acceptable (62.5%): significant fixes needed; no heuristic marked n/a.** |

## Strengths

1. The answer is prominent before the article body. The adjacent tester, date, versions and device make the evidence visible rather than burying it in an editorial policy.
2. The article has a readable serif column, meaningful section headings, copyable code, and a desktop TOC. It is well suited to switching attention between a broken setup and the guide.
3. The brand is calm and credible in light mode. Topic hubs genuinely explain which guide fits a task, and articles connect readers to original documentation.

## Priority issues

### P0 — Card link overlays block primary discovery actions

`src/components/cards/PostCard.astro` uses `after:absolute after:inset-0` without a positioned card ancestor. On the live homepage at 1280 pixels, the first card link's pseudo-element measured 1280×900 rather than the card. Hit-testing the hero heading, search input, and several visible cards returned the final Cloudflare article anchor. Playwright clicks on `#home-q` timed out at both 375 and 1280 because that anchor intercepted pointer events. Keyboard focus remains a workaround, but the primary pointer search flow is blocked.

Scope the stretched link to its own card by giving the article a positioned containing block; verify card whitespace, title, search input, and neighbouring cards with real clicks. Do this before compositional polish. Suggested command: `/impeccable harden`.

### P1 — Dark search is nearly unreadable

In `search-375-dark.png`, Pagefind result titles, result counts, and excerpts remain dark grey against the dark page. Its white search field and yellow highlights also ignore the established theme. Dark desktop article navigation and reader action labels are visibly weak too (`article-1280-dark-viewport.png`). This is a core access problem for a reader who chose dark mode.

Map Pagefind variables and all interface text to the existing tokens, and check both OS-selected and manually toggled themes. Retain the current palette. Suggested command: `/impeccable audit`, then `/impeccable harden`.

### P1 — Search indexes article furniture as if it were an answer

Searching `cloudflare` yields a DNS article excerpt beginning “post. Read next.” Its Sources sub-result contains “ShareShareCopy linkHacker News. Did this fix it?” Another result is primarily a related-guide mention. The correct guide is first, but the remaining excerpts undermine confidence and create false leads. Mobile presents a long sequence of sub-results for only three matching articles.

Limit the search body to the answer and editorial content; exclude byline/date chrome, sharing, feedback, newsletter, FAQ furniture when irrelevant, and related cards. Use a useful article summary and a small number of genuinely relevant section matches. Add recovery suggestions plus topic links for zero results. Suggested commands: `/impeccable distill`, `/impeccable clarify`.

### P1 — The first discovery screen hides the publication's best proof

The homepage makes twelve equally weighted articles the next decision after the hero; the two tested procedures are near the bottom. On mobile, “Start with a topic” follows the entire twelve-card list. The mobile rail initially exposes Windows & Mac, Phones and Excel & Office; hosting and automation require sideways discovery, with no clear scroll cue. The main promise is tested fixes, while the first nine recommendations are explainers.

Show a compact, deliberately selected set of tested/task-oriented entry points first, then latest explainers and all topics. Make hosting and automation readily visible for the stated audience without deleting the existing categories. Keep the chronological archive accessible. Suggested commands: `/impeccable layout`, `/impeccable clarify`.

### P1 — Newsletter and footer promise capabilities the site disclaims

The footer says “One tested guide a week” next to Subscribe, followed by the small disclaimer “Email delivery is not active yet.” The copyright line says versions are listed on every post, but only two of twelve live articles have test records. Honest distinctions elsewhere are weakened at the final point of trust.

Use an accurate notification-list label and make the inactive-delivery expectation clear before submission. Align the general testing claim with the distinction between tested procedures and sourced explainers. Do not activate delivery or collect new commitments as part of this UI fix. Suggested command: `/impeccable clarify`.

## Cognitive load

**Three failures out of seven: moderate.**

- Chunking: fail on homepage. Twelve sibling article choices precede six topic choices; visual repetition makes the list feel longer.
- Grouping: pass. Cards, topic sections, answer/test blocks, and article sections have clear boundaries.
- Visual hierarchy: pass. H1, answer and body have distinct emphasis; the discovery ranking itself needs editorial improvement.
- One thing at a time: fail on mobile article. A fixed, horizontally scrolling reading toolbar overlays the TOC/body before a reader has selected a reading mode.
- Minimal choices: fail. Six top-level topics, twelve homepage articles, eight TOC links, and eight actionable reader buttons exceed four at their respective decision points. Counts alone are not defects, but these sets lack enough prioritisation.
- Working memory: pass. Breadcrumbs, visible article title and section headings keep context available.
- Progressive disclosure: pass overall. TOC can collapse, feedback note follows the negative choice, and search code loads on demand. The toolbar is the notable exception.

## Emotional journey

Arrival reassures: the direct headline and calm page promise competent help. Discovery then introduces doubt: mostly explainers appear under the tested-fix claim, and blocked click targets can feel like a broken site. The article is the positive peak: a short answer, test record, recognisable errors and candid failed attempts. The ending becomes less confident: unrelated previous/next content, feedback without an explicit no-response expectation, and a newsletter whose weekly promise is immediately disclaimed. End with a relevant next diagnostic action and accurate expectations.

## Persona red flags

- **Jordan, first-time visitor:** the mobile rail hides the relevant hosting/automation entry points, and raw type labels add taxonomy rather than guidance. The footer's weekly promise and delivery disclaimer demand interpretation.
- **Sam, accessibility-dependent reader:** dark search results are hard to read; toolbar text-size buttons are beyond the initially visible mobile toolbar region (349px visible versus 452px scroll width). A settled TOC jump put the target heading at y≈72 under the roughly 110px two-row coarse-pointer sticky header, hiding the section title. Main focus outlines and the skip link are positive foundations; no full screen-reader claim is made.
- **Casey, distracted mobile reader:** twelve cards delay topic browsing; the bottom toolbar covers TOC rows and offers sideways scrolling without an obvious affordance. Returning to a section requires re-establishing context when its heading lands behind the header.

No extra invented project persona: CLAUDE.md has no Design Context section.

## Minor observations

- Hosting hub repeats each of its two articles in introductory prose, “Start here”, and a category card. Keep the explicit explanation of which task fits which guide; reduce duplicate navigation.
- Use actual pillar names instead of `pillar.replace('-', ' & ')`, which renders “ai & tools”.
- Scope “Did this fix it?” to applicable article types; an explanation may help understanding without fixing anything.
- At 768px, the footer's three-column email field becomes narrow enough to truncate the placeholder heavily. A stacked form at this width is clearer.
- Reader controls need a clear current text-size state and accessible name for each visual A. The existing aria-labels are a good start.
- The diagnostic table is a useful navigation pattern; make its “Relevant section” entries actual in-page links.

## Questions for synthesis

1. If the publication's proof is tested procedures, why must a new reader pass nine explainers to see the first tested guide?
2. Can the first screen let a reader choose “fix a hosting problem” or “build an automation” while preserving the wider archive?
3. Which reader controls are important enough to occupy the mobile viewport before the article starts?
4. What exactly should a visitor expect after leaving an email address today?

Questions are input to the parent synthesis; no separate user question was sent from this assessment.
