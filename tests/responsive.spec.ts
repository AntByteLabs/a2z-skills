import { test, expect } from '@playwright/test';
import { firstPostPath, firstHubPath } from './helpers';

const postPath = firstPostPath();
const hubPath = firstHubPath();
const paths = ['/', '/topics/', '/about/', hubPath, postPath].filter(Boolean) as string[];

/**
 * Widths that actually matter: the narrowest phone still in use, the common
 * iPhone, a large phone, a tablet and a laptop.
 */
const widths = [320, 360, 390, 430, 768, 1280];

test.describe('nothing scrolls sideways', () => {
  for (const width of widths) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const path of paths) {
        await page.goto(path);
        const { scrollW, clientW, culprits } = await page.evaluate(() => {
          const vw = document.documentElement.clientWidth;
          const inScroller = (el: Element) => {
            for (
              let n: Element | null = el;
              n && n !== document.body;
              n = n.parentElement
            ) {
              if (/(auto|scroll)/.test(getComputedStyle(n).overflowX)) return true;
            }
            return false;
          };
          return {
            scrollW: document.documentElement.scrollWidth,
            clientW: vw,
            culprits: [...document.querySelectorAll('body *')]
              .filter((el) => el.getBoundingClientRect().right > vw + 1 && !inScroller(el))
              .slice(0, 3)
              .map((el) => `${el.tagName}.${String(el.className).slice(0, 40)}`),
          };
        });
        expect(culprits, `${path} at ${width}px`).toEqual([]);
        expect(scrollW, `${path} at ${width}px`).toBeLessThanOrEqual(clientW);
      }
    });
  }
});

test.describe('touch targets', () => {
  test.skip(({ isMobile }) => !isMobile, 'the 44px rule applies to touch pointers');

  test('every header control clears 44px on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const controls = page.locator('header a, header button');
    const count = await controls.count();
    expect(count).toBeGreaterThan(3);
    for (let i = 0; i < count; i += 1) {
      const box = await controls.nth(i).boundingBox();
      if (!box) continue;
      const label = (await controls.nth(i).textContent())?.trim().slice(0, 24);
      expect(box.height, `"${label}" is ${box.height}px tall`).toBeGreaterThanOrEqual(43.5);
    }
  });

  test('the newsletter field and button are comfortable to tap', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const form = page.locator('form[data-newsletter]').first();
    for (const sel of ['input[name="email"]', 'button[type="submit"]']) {
      const box = await form.locator(sel).boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(43.5);
    }
  });
});

test.describe('the reading experience', () => {
  test.skip(!postPath, 'no posts in this build');

  test('inline code renders without literal backticks', async ({ page }) => {
    await page.goto(postPath!);
    const body = await page.locator('article').innerText();
    expect(body).not.toMatch(/`[a-z_./-]+`/i);
  });

  test('code blocks scroll instead of widening the page', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto(postPath!);
    const pres = page.locator('article pre');
    for (let i = 0; i < (await pres.count()); i += 1) {
      const overflowX = await pres.nth(i).evaluate((el) => getComputedStyle(el).overflowX);
      expect(['auto', 'scroll']).toContain(overflowX);
    }
  });

  test('the body column stays inside a readable measure', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(postPath!);
    const width = await page
      .locator('article .prose')
      .first()
      .evaluate((el) => el.clientWidth);
    expect(width).toBeLessThanOrEqual(820);
  });

  test('the skip link moves focus to the content', async ({ page }) => {
    await page.goto(postPath!);
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.getAttribute('href'));
    expect(focused).toBe('#main');
  });

  test('headings go in order, with one h1', async ({ page }) => {
    await page.goto(postPath!);
    const levels = await page.$$eval(
      'article h1, article h2, article h3, article h4',
      (els) => els.map((el) => Number(el.tagName[1])),
    );
    expect(levels.filter((l) => l === 1)).toHaveLength(1);
    for (let i = 1; i < levels.length; i += 1) {
      expect(levels[i]! - levels[i - 1]!).toBeLessThanOrEqual(1);
    }
  });
});

test.describe('ad slots', () => {
  test.skip(!postPath, 'no posts in this build');

  test('no empty ad boxes are shown to a reader', async ({ page }) => {
    await page.goto(postPath!);
    const slots = page.locator('[data-ad-slot]');
    const count = await slots.count();

    // With no network approved there is nothing to show, so nothing renders.
    // When a slot does render it must reserve its height, or turning ads on
    // would shift the page and break the CLS budget.
    for (let i = 0; i < count; i += 1) {
      const slot = slots.nth(i);
      await expect(slot).toHaveAttribute('aria-label', 'Advertisement');
      if (!(await slot.isVisible())) continue;
      const box = await slot.boundingBox();
      expect(
        box!.height,
        'an ad slot with no reserved height would shift the page',
      ).toBeGreaterThan(200);
    }
  });

  test('ads.txt is served', async ({ request }) => {
    const res = await request.get('/ads.txt');
    expect(res.ok()).toBeTruthy();
    expect(await res.text()).toContain('ads.txt');
  });
});

/**
 * Tailwind's dark variant follows prefers-color-scheme on its own, which
 * ignores the toggle. When those two disagreed, prose-invert painted white
 * text on a white page. Every combination is checked here.
 */
test.describe('the theme follows the toggle, not just the system', () => {
  test.skip(!postPath, 'no posts in this build');

  /** Ask the browser to resolve any colour syntax to sRGB, then measure it. */
  const relativeLuminance = async (page: import('@playwright/test').Page, css: string) =>
    page.evaluate((colour) => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = colour;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      const lin = (c: number) => {
        const v = c / 255;
        return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * lin(r!) + 0.7152 * lin(g!) + 0.0722 * lin(b!);
    }, css);

  for (const system of ['light', 'dark'] as const) {
    for (const chosen of [null, 'light', 'dark'] as const) {
      test(`system ${system}, chosen ${chosen ?? 'nothing'}`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: system });
        if (chosen) {
          await page.addInitScript((v) => {
            try {
              localStorage.setItem('a2z-theme', v as string);
            } catch {
              /* storage blocked */
            }
          }, chosen);
        }
        await page.goto(postPath!);

        const { bg, body, prose, heading } = await page.evaluate(() => {
          const rgb = (el: Element, prop: string) =>
            getComputedStyle(el).getPropertyValue(prop);
          return {
            bg: rgb(document.body, 'background-color'),
            body: rgb(document.body, 'color'),
            prose: rgb(document.querySelector('article .prose p')!, 'color'),
            heading: rgb(document.querySelector('article .prose h2')!, 'color'),
          };
        });

        const effective = chosen ?? system;
        const bgLum = await relativeLuminance(page, bg);
        // The page background must match the theme that is actually in force.
        if (effective === 'dark') expect(bgLum, `bg ${bg}`).toBeLessThan(0.2);
        else expect(bgLum, `bg ${bg}`).toBeGreaterThan(0.7);

        // And every kind of text must contrast against it, not against the
        // theme the operating system happens to prefer.
        for (const [name, colour] of [
          ['body', body],
          ['prose', prose],
          ['heading', heading],
        ] as const) {
          const lum = await relativeLuminance(page, colour);
          const ratio = (Math.max(lum, bgLum) + 0.05) / (Math.min(lum, bgLum) + 0.05);
          expect(ratio, `${name} ${colour} on ${bg}`).toBeGreaterThanOrEqual(4.5);
        }
      });
    }
  }
});

test.describe('dark mode', () => {
  test('the dark scheme applies and persists', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Switch between light and dark').click();
    const theme = await page.evaluate(() => document.documentElement.dataset.theme);
    expect(['light', 'dark']).toContain(theme);
    const stored = await page.evaluate(() => localStorage.getItem('a2z-theme'));
    expect(stored).toBe(theme);
    await page.reload();
    expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe(theme);
  });

  test('text stays legible against the dark background', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    const { bg, fg } = await page.evaluate(() => {
      const s = getComputedStyle(document.body);
      return { bg: s.backgroundColor, fg: s.color };
    });
    expect(bg).not.toBe(fg);
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
  });
});
