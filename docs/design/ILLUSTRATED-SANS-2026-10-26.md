# Illustrated site and sans-serif reading

The owner requested artwork for the blogs and hero sections, a more expressive
interface, and friendly sans-serif reading text. This pass retains the blue,
paper and ink palette and the existing search, filters and reading controls.

## Artwork

Fourteen original illustrations were generated with the built-in image_gen
tool: one homepage workbench and one cover for each of the thirteen published
articles. The style uses textured paper, cobalt blue, warm coral and sage.
They are editorial illustrations, not screenshots or test evidence. Article
figures carry an Editorial illustration caption. Author identities and test
records were not illustrated or invented.

Every generated image was reviewed. The selected files were converted to WebP
and copied into the project. The fourteen source assets total 898,974 bytes;
the largest is 95,544 bytes. The PNG originals remain in Codex's generated-image
folder. They are not required by the deployed site.

- Homepage artwork: [tech-workbench.webp](../../src/assets/illustrations/tech-workbench.webp).
- Article artwork: `src/content/posts/<slug>/cover-illustration.webp`.
- Exact paths, dimensions and sizes: [asset manifest](art-assets-2026-10-26.json).
- Final prompts and generation method: [prompt manifest](art-prompts-2026-10-26.json).

Artwork appears in the home hero, featured guides, library cards, topic tiles,
topic index, topic headers, article figures and related recommendations.
Article and home sharing metadata use unique 1200 by 630 JPEG versions with
image descriptions. These derived URLs include content hashes so revised
artwork gets a new asset URL.

## Reading and navigation

Articles now use the system sans-serif at 18px on phones and 19px on larger
screens, with 1.78 line-height and a 40rem maximum reading width. Bricolage
remains the heading and interface face. Text-size controls still scale the
article and remember the selection. The serif declaration and preload were
removed; no new font or JavaScript dependency was introduced.

The homepage has a stronger blue hero with its own illustration. Featured
guides remain visible near the top. Image-led topic links, larger card titles
and comfortable descriptions give the catalogue more visual variety. The
mobile topic menu, filters, search recovery and dark theme remain available.

## Image SEO and delivery

Main article images have descriptive alt text. Decorative thumbnails have empty
alt attributes because their adjacent links already name the article. Native
picture/img elements expose images before JavaScript runs. The sitemap includes
an image location for every published article. BlogPosting and sharing metadata
reference the illustrated share image.

Astro emits responsive AVIF/WebP sources with explicit dimensions. The main
home hero loads eagerly with high fetch priority; below-fold artwork loads
lazily. Illustrations are hidden when printing a procedure. Cache rules, Worker
routes and bindings, ads and paid resources were not changed.

These choices follow [Google's image guidance](https://developers.google.com/search/docs/appearance/google-images),
[image sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps)
and [Astro's image components](https://docs.astro.build/en/guides/images/).
They support image discovery and usable pages; they do not promise rankings.

## Verification

The complete local check passed: 136 browser tests and nine unit tests, with
two intentional desktop touch-test skips. All 43 built HTML pages passed link
and transfer-size checks. Tests decoded every article illustration and sharing
image, checked all thirteen sitemap image URLs, and confirmed sans-serif text
and operation without JavaScript.

Nine Lighthouse lab runs across the home page, an article and a topic hub
scored 100 in performance, accessibility, best practices and SEO. Maximum lab
LCP was 1.731 seconds; CLS was 0. These are lab results rather than field data.
See [Lighthouse results](lighthouse-illustrated-2026-10-26.json).

Screenshots were captured at 375, 768 and 1280 pixels, with additional dark
captures. All twelve principal captures had no document overflow. Visual
review also found and fixed a featured-thumbnail container that could shrink
inside its row. Screenshots remain local in `/tmp/a2z-illustrated-review/`.

Published to [a2zskillsewa.com](https://a2zskillsewa.com/) and pushed to main.
The live browser decoded all fourteen artwork images and all fourteen unique
1200 by 630 sharing images. All thirteen image-sitemap entries and all 29 page
URLs returned 200. Page canonicals remained correct. Phone, tablet and desktop
layout checks found no overflow; pointer search worked and no browser errors
were recorded. Article text used the sans-serif stack on the live site.

Worker version: `c08caff7-ad43-48ac-971d-b87f42e01569`.
See [live verification and public asset URLs](live-illustrated-2026-10-26.json).
The local preview server was stopped after verification.
