# Compact publication with cards

The user selected option 1 from three working previews, adding article cards. The shipped layout keeps its compact masthead, short introduction, lead tested guide and two supporting stories. The article collection uses bordered cards with modest cover images and a quiet topic sidebar.

White surfaces, charcoal text, blue links and smaller corners replace the previous large illustrated banner and rounded presentation. Headings use the existing self-hosted Bricolage font; reading text remains system sans at 18–19px. Topic pages use a simpler introduction. Search, local filters, dark mode, mobile navigation and reader controls remain available.

No article URLs, procedures, testing claims or content dates changed. Canonicals, schema, Pagefind search, responsive illustrations, social images and sitemaps remain intact. Original generation prompts for the 14 existing illustrations are attached in adjacent provenance sidecars. No new images or paid services were required.

## Verification

- Full repository check: 9 unit tests and 136 browser tests passed, with 2 intentional desktop touch skips.
- Visual inspection: desktop, mobile, tablet, article and dark-mode captures.
- Independent review: one material finding, a leftover card hover shadow. Removed it, rebuilt and recaptured. The reviewer scored that fix resolved and returned `ship` at that scope.
- Lighthouse: nine mobile lab runs across the homepage, an article and a topic page. All four categories scored 100 in every run; largest LCP 1.206 seconds and CLS 0. These are local lab measurements.
- Design system: DESIGN.md and .impeccable/design.json document the final implementation.

The existing 10,000-click target remains a goal, not a forecast. No private Search Console performance data was available for this design change.
