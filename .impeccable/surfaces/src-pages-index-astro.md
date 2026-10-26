---
version: 1
slug: 'src-pages-index-astro'
primary_target: 'src/pages/index.astro'
related_targets:
  [
    'src/components/site/Header.astro',
    'src/components/site/GuideLibrary.astro',
    'src/styles/global.css',
    'src/pages/topics/[pillar].astro',
  ]
---

# Clean publication redesign

Read surface for global English readers finding automation, hosting and troubleshooting answers. User selected option 1, compact publication, explicitly adding cards. Preserve existing URLs, sources, named testing records, search, filtering, accessibility, dark mode and responsive artwork.

## Direction contract

THESIS: A compact technology publication whose hierarchy makes the next useful guide obvious.

OWN-WORLD: White and charcoal, restrained blue links, friendly Bricolage headings and sans reading text. Thin rules, modest ten-pixel card corners, no decorative shadows.

STORY: Readers recognise the tools, see the distinction between tested procedures and explanations, then open a guide or filter the collection.

FIRST VIEWPORT: Strong masthead and navigation above a short introduction. A large lead tested guide and small illustration occupy the left; two supporting guides sit to the right. Latest article cards and a quiet topic sidebar begin below. Search stays obvious. The signature interaction is instant local filtering with a live count and clear reset; motion is limited to colour changes.

FORM: Compact publication, own candidate 7, seed:288d67292119315b. User approved option 1 in chat with cards replacing the preview's article rows. Code-led; screenshot .impeccable/previews/compact-publication.png is the composition reference.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Responsive library amendment

User requested three article cards per row from the collection shown in their screenshot, with future ads organised properly. Keep one column below 640px, two from 640px and three from 1280px. Narrow the desktop topic sidebar to 15rem. Prepare one optional full-width advertising row after six matching cards, only when at least nine match; filtering repositions or hides it. Keep both advertising flags disabled and render no empty space while disabled.
