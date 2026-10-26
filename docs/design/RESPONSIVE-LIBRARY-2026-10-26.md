# Three-column article library

The home collection now shows three cards per row from 1280px, two from 640px and one below 640px. The desktop topic sidebar is 15rem wide, leaving room for readable cards. Image size hints match the narrower desktop cards.

A future advertising placement spans the full collection width after six visible cards. Six fills complete rows at every supported column count. Filters move the placement after the sixth matching card and hide it when fewer than nine articles match. There is one placement in the current 13-article catalogue. Advertising stays disabled, so no ad wrapper or blank gap renders today.

Visible ad containers reserve at least 250px before network content arrives and carry an Advertisement label. Future network creatives must fit the container width. No network code or monetisation flags were enabled.

Verification: full check passed 9 unit tests and 140 browser tests, with 2 intentional desktop touch skips. New coverage checks one/two/three columns, card bounds and page overflow at nine widths from 320px to 2560px. A browser-only advertising fixture checks full-row placement, reserved height and filter behaviour without enabling advertising. Desktop, tablet and phone screenshots were inspected.
