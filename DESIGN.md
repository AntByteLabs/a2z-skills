---
name: A2Z Skills
description: A compact, friendly publication for practical technology guides.
colors:
  ink: oklch(0.2 0.025 268)
  ink-soft: oklch(0.455 0.02 265)
  ink-faint: oklch(0.525 0.016 265)
  paper: oklch(1 0 0)
  paper-sunk: oklch(0.98 0.003 260)
  rule: oklch(0.89 0.007 260)
  brand: oklch(0.5 0.16 258)
  brand-deep: oklch(0.36 0.14 260)
  brand-wash: oklch(0.955 0.025 255)
  accent: oklch(0.53 0.16 42)
  accent-edge: oklch(0.62 0.16 45)
  good: oklch(0.47 0.12 155)
  good-deep: oklch(0.41 0.11 155)
  good-wash: oklch(0.94 0.045 155)
  warn: oklch(0.52 0.13 75)
  warn-deep: oklch(0.44 0.115 75)
  bad: oklch(0.5 0.18 25)
  ink-invert: oklch(0.16 0.02 268)
  highlight: oklch(0.93 0.09 95)
typography:
  display:
    fontFamily: "'Bricolage Grotesque', ui-sans-serif, system-ui, sans-serif"
    fontSize: 1.875rem
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: -0.02em
  title:
    fontFamily: "'Bricolage Grotesque', ui-sans-serif, system-ui, sans-serif"
    fontSize: 1.25rem
    fontWeight: 600
    lineHeight: 1.375
    letterSpacing: -0.02em
  body:
    fontFamily: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif
    fontSize: 1rem
    lineHeight: 1.6
  reading:
    fontFamily: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif
    fontSize: 1.125rem
    lineHeight: 1.78
    letterSpacing: '0'
  label:
    fontFamily: "'Bricolage Grotesque', ui-sans-serif, system-ui, sans-serif"
    fontSize: 0.75rem
    fontWeight: 600
    lineHeight: 1.5
  code:
    fontFamily: ui-monospace, 'SF Mono', Menlo, Consolas, monospace
rounded:
  card: 0.625rem
  soft: 0.5rem
  bubble: 1.75rem
  pill: 999px
spacing:
  gutter: 1rem
  gutter-wide: 1.5rem
  card-padding: 1.25rem
  compact-card-padding: 1rem
  grid-gap: 1.25rem
components:
  button-primary:
    backgroundColor: '{colors.brand-deep}'
    textColor: '{colors.paper}'
    rounded: '{rounded.pill}'
    padding: 0.625rem 1rem
  button-primary-hover:
    backgroundColor: '{colors.brand}'
  button-reset:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    rounded: '{rounded.pill}'
    padding: 0.5rem 1rem
  search-field:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    rounded: '{rounded.soft}'
    padding: 0 0.75rem
    height: 2.75rem
  filter-field:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    rounded: '{rounded.soft}'
    padding: 0.5rem 0.75rem
  article-card:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    rounded: '{rounded.card}'
    padding: 1.25rem
  metadata-label:
    backgroundColor: transparent
    textColor: '{colors.ink-soft}'
    typography: '{typography.label}'
    padding: '0'
  reader-button:
    textColor: '{colors.ink}'
    rounded: '{rounded.bubble}'
    padding: 0.5rem 0.85rem
  masthead-navigation:
    textColor: '{colors.ink-soft}'
    typography: '{typography.label}'
---

# Design System: A2Z Skills

## Overview

**Creative North Star: "The Compact Technology Publication"**

A2Z Skills is a clean, simple, professional and friendly publication. A compact masthead, clear headline hierarchy, thin rules and modest cards help readers find a useful guide quickly. Bricolage Grotesque adds warmth to headings and controls; a system sans keeps reading familiar and steady.

White and charcoal surfaces carry restrained blue links. Existing editorial illustrations supply colour without competing with the reading surface. Tested procedures and sourced explanations remain visibly distinct, with factual metadata rather than decorative claims.

**Key Characteristics:**

- Compact publication hierarchy with article cards.
- Friendly sans-serif headings and reading text.
- Restrained blue actions on quiet light or dark surfaces.
- Responsive illustrations, visible focus and progressively enhanced filtering.

## Colors

The primary palette pairs quiet white and charcoal with restrained blue. The frontmatter preserves the source's normative OKLCH values; `-dark` entries record the corresponding dark-theme overrides.

### Primary

- **Guide blue** (`brand`, `brand-deep`, `brand-wash`): links, search actions, selected controls, testing evidence and informational asides. Deep blue carries small action text; the wash carries supporting surfaces.

### Secondary

- **Warm accent** (`accent`, `accent-edge`): limited supporting emphasis in existing article components.
- **Semantic feedback** (`good`, `good-deep`, `good-wash`, `warn`, `warn-deep`, `bad`): tips, warnings, errors and form results. Preserve the meaning of these hues rather than using them as topic colours.

### Neutral

- **Paper** (`paper`, `paper-sunk`): main and inset surfaces.
- **Charcoal** (`ink`, `ink-soft`, `ink-faint`): primary text, supporting prose and dates respectively.
- **Fine rule** (`rule`): card edges, section dividers and input borders.
- **Reading highlight** (`highlight`): current spoken text and search matches. `ink-invert` is the existing dark text companion.

The theme defaults to the system preference and supports explicit light or dark selection through `data-theme`. The same semantic names change values, including callout feedback colours. Do not apply light-only literal colours inside themed components.

**The Restrained Blue Rule.** Use blue for links, actions, selected states and testing evidence; keep the reading surface neutral.

## Typography

**Display Font:** Bricolage Grotesque, self-hosted variable font with a sans-serif fallback.
**Body Font:** System sans-serif, including Segoe UI and Roboto fallbacks.
**Label/Mono Font:** Labels generally follow Bricolage; code uses the system monospace stack.

The pairing is friendly, direct and practical. Headings use tight tracking and balanced wrapping; paragraphs use steady leading and natural sentence case. The frontmatter records mobile roles; the implemented responsive changes follow below.

- **Display:** featured guide headlines step from 1.875rem to 2.25rem at the small breakpoint. Article titles start at 1.6rem and reach 2.25rem; both use bold weight and tight leading.
- **Title:** article-card headings use the title role; compact cards use 1.125rem. Section titles use 1.5rem.
- **Body:** general UI body text rises from 1rem to 1.0625rem at the small breakpoint.
- **Reading:** article prose rises from 1.125rem to 1.1875rem, with 1.78 leading. Dark reading text uses weight 420, 1.8 leading and 0.004em tracking. Reader text-size controls multiply this base scale.
- **Label:** small metadata is quiet and factual. Dates and numeric counts use tabular figures. Code wraps inline and scrolls within blocks.

**The Reading Measure Rule.** Keep article prose within its 40rem maximum; use the wider shell for navigation, collections and supporting information.

## Layout

The shared shell has a maximum width of 83rem with 1rem gutters, increasing to 1.5rem from 640px. The masthead is 4rem high, increasing to 5rem from 1024px. Desktop navigation and inline search appear at 1024px; smaller screens use a native topic disclosure and separate search access.

The home introduction stays short. Its featured guides split into a lead and supporting column at 1024px, with the lead illustration kept small beside the summary. The article library uses one card column below 640px and two above it, with a 1.25rem gap. A 17rem topic sidebar joins at 1024px, separated by a vertical rule; it follows the cards on narrow screens.

Topic hubs use a narrower 56rem wrapper, grouped cards and restrained section spacing. Article templates use a 19rem desktop sidebar and a main article capped at 42rem; the reading prose itself remains capped at 40rem. Secondary prose uses the existing 66ch measure. Tables of contents move into the article on small screens.

Preserve all reading and normal navigation without JavaScript. Local filtering appears only after its script is ready; the full collection remains available otherwise.

## Elevation & Depth

The publication is primarily flat: paper, inset surfaces and thin rules establish hierarchy. Library cards explicitly suppress shadows. Existing generic card utilities and the mobile menu retain a subtle `shadow-card`; the source also defines a `shadow-lift` token, which is not a recommendation to add lift. The sticky masthead uses a translucent paper surface and medium backdrop blur. Reading highlights use a small matching spread to surround the current text.

**The Quiet Card Rule.** Use a thin rule and headline colour to distinguish article cards; do not add decorative lift to the library.

## Shapes

Article cards and article callouts use the card radius (10px). Search and filter controls use the soft radius (8px). Existing reader controls, illustration frames and notification-list controls use the larger bubble or pill radii where their specific component calls for them. These exceptions do not change the modest article-card silhouette.

Rules are generally 1px. Artwork clips inside its frame and reserves space with explicit dimensions. Article illustrations are marked as editorial artwork and hidden in print.

## Components

### Buttons

Primary notification-list actions use deep blue and paper text, a pill shape and the frontmatter padding; hover uses the brand tone. Home search uses the soft shape. Clear-filter controls use a paper background and thin rule, changing the edge to deep blue on hover. Disabled reset controls reduce opacity and use a default cursor. Focus uses a 2px brand outline with 2px offset. Coarse-pointer targets have a minimum height of 44px.

### Chips

Metadata labels and tested marks are compact text treatments with transparent backgrounds and no internal padding. Tested marks use blue and a small inline SVG check; they require an actual named testing record. Topic and type labels should read as information rather than stickers.

### Cards / Containers

Article cards have the card radius, paper background and thin rule. Standard card content uses 1.25rem padding; compact cards use 1rem. Images use a 2:1 crop. The title and outer border change colour on hover. Descriptions are limited to three lines; date and reading time sit below a fine rule. The title link stretches across the card. Home library cards have no shadow.

### Inputs / Fields

Search uses soft corners, paper, a fine rule and a 44px minimum height. Filters use labelled native selects with the same surface and shape. Preserve visible focus and native keyboard operation. Pagefind inherits semantic theme tokens, a soft radius and system sans text; result headings use Bricolage.

### Navigation

The compact wordmark pairs charcoal with blue. Desktop links use small Bricolage text, muted at rest and blue with an underline on hover. Mobile topics use a native disclosure with a paper dropdown; the current topic has a blue wash and semibold text. Escape closes it and returns focus; an outside click closes it. Search remains available at every viewport.

### Guide filtering

Topic and article-type selectors filter the existing local cards immediately. A live status reports the visible count; clear filters restores the collection and becomes disabled when nothing is selected. A plain empty-state message offers recovery. Matching is combined across both selectors, and restored native select values are reapplied on page return.

### Reading controls and editorial artwork

The floating reading toolbar supports text sizing, speech and auto-scroll. Controls are compact and rounded, with quiet hover surfaces and a blue selected state. It can move away while scrolling, returns for keyboard focus, and respects reduced motion. Reader controls do not narrow the article measure.

The fourteen existing raster illustrations retain their original pixels. Exact original prompts are recorded in adjacent `.webp.json` sidecars produced by the embed-prompt tool; `docs/design/art-prompts-2026-10-26.json` is the origin manifest. This documentation does not claim that embedded image metadata bytes changed. Keep illustrations visibly distinct from test screenshots.

## Do's and Don'ts

### Do:

- Do use the existing light and dark semantic tokens together.
- Do keep cards modestly rounded and article text in a friendly sans-serif.
- Do preserve visible keyboard focus, coarse-pointer targets and reduced-motion handling.
- Do keep tested records distinct from sourced explanations and editorial illustrations.
- Do preserve responsive image dimensions and the adjacent original-prompt provenance files.

### Don't:

- Don't replace the compact publication with an oversized promotional hero.
- Don't add decorative card shadows or hover movement to the article library.
- Don't use serif body text or turn metadata into decorative badges.
- Don't present editorial illustrations as evidence of a tested procedure.
