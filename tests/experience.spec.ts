import { test, expect } from '@playwright/test';

const article = '/cloudflare-workers-custom-domain-not-working/';

test('card whitespace opens its own article and leaves other actions clickable', async ({
  page,
}) => {
  await page.goto('/');
  const cards = page.locator('[data-guide-list] article');
  for (const index of [0, 1]) {
    const card = cards.nth(index);
    const href = await card.locator('h3 a').getAttribute('href');
    await card.click({ position: { x: 10, y: 10 } });
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await page.goto('/');
  }
  await page.locator('#home-q').click();
  await expect(page.locator('#home-q')).toBeFocused();
});

test('library filters combine, explain an empty result and reset without creating facet URLs', async ({
  page,
}) => {
  await page.goto('/');
  const items = page.locator('[data-guide-topic]:visible');
  const total = await items.count();
  const testedCount = await page.locator('[data-guide-type="tested"]').count();
  const automationCount = await page
    .locator('[data-guide-topic="automation"][data-guide-type="tested"]')
    .count();
  await page.getByLabel('Article type', { exact: true }).selectOption('tested');
  await expect(items).toHaveCount(testedCount);
  await page.getByLabel('Topic', { exact: true }).selectOption('automation');
  await expect(items).toHaveCount(automationCount);
  await expect(items.filter({ hasText: 'Self-host n8n on Coolify' })).toHaveCount(1);
  await page.getByLabel('Topic', { exact: true }).selectOption('phones');
  await expect(items).toHaveCount(0);
  await expect(page.locator('[data-guide-empty]')).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
  await expect(items).toHaveCount(total);
  await expect(page.locator('[data-guide-empty]')).toBeHidden();
  expect(new URL(page.url()).search).toBe('');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://a2zskillsewa.com/',
  );
});

test('the mobile menu exposes every topic, closes with Escape and identifies an article topic', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(article);
  const menu = page.locator('[data-topic-menu]');
  const summary = menu.locator('summary');
  await summary.click();
  const links = menu.locator('a[href^="/topics/"]');
  await expect(links).toHaveCount(7);
  for (const link of await links.all()) await expect(link).toBeVisible();
  await expect(menu.locator('a[aria-current="page"]')).toContainText('Websites & Hosting');
  await page.keyboard.press('Escape');
  await expect(menu).not.toHaveAttribute('open', '');
  await expect(summary).toBeFocused();
  await summary.click();
  await menu.getByRole('link', { name: 'Automation', exact: true }).click();
  await expect(page).toHaveURL(/\/topics\/automation\/$/);
});

test('the complete catalogue and topic menu work without JavaScript', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 375, height: 812 },
  });
  try {
    const page = await context.newPage();
    await page.goto(baseURL!);
    const cards = page.locator('[data-guide-list] article');
    expect(await cards.count()).toBeGreaterThan(2);
    await expect(page.locator('[data-guide-filters]')).toBeHidden();
    await page.locator('[data-topic-menu] summary').click();
    await expect(
      page
        .locator('[data-topic-menu]')
        .getByRole('link', { name: 'Automation', exact: true }),
    ).toBeVisible();
    await page.goto(`${baseURL}/search/`);
    await expect(page.locator('noscript p')).toBeVisible();
    await expect(
      page
        .getByRole('navigation', { name: 'Search alternatives' })
        .getByRole('link', { name: 'Automation', exact: true }),
    ).toBeVisible();
  } finally {
    await context.close();
  }
});

test('search excludes sharing furniture and offers recovery when there is no match', async ({
  page,
}) => {
  await page.goto('/search/?q=qzxvblorpzz');
  await expect(page.locator('.pagefind-ui__message')).toContainText('No results');
  await expect(page.locator('.pagefind-ui__result-link')).toHaveCount(0);
  await expect(page.getByRole('navigation', { name: 'Search alternatives' })).toBeVisible();
  await page.locator('.pagefind-ui__search-input').fill('Cloudflare');
  await expect(
    page
      .locator('.pagefind-ui__result-link')
      .filter({ hasText: 'Cloudflare Workers custom domain not working' })
      .first(),
  ).toBeVisible();
  const indexedContent = await page.evaluate(async () => {
    const path = '/pagefind/pagefind.js';
    const pagefind = await import(/* @vite-ignore */ path);
    const result = await pagefind.search('Cloudflare');
    return await Promise.all(
      result.results.map(
        async (item: { data: () => Promise<{ content: string }> }) =>
          (await item.data()).content,
      ),
    );
  });
  for (const content of indexedContent)
    expect(content).not.toMatch(/Hacker News|Copy link|Did this fix it\?/);
});

test('a failed search bundle has a working retry', async ({ page }) => {
  let attempts = 0;
  await page.route('**/pagefind/pagefind-ui.js*', async (route) => {
    if (attempts++ === 0) await route.abort('failed');
    else await route.continue();
  });
  await page.goto('/search/?q=n8n');
  await page.getByRole('button', { name: 'Retry search' }).click();
  await expect(
    page
      .locator('.pagefind-ui__result-link')
      .filter({ hasText: 'Self-host n8n on Coolify' })
      .first(),
  ).toBeVisible();
  expect(attempts).toBe(2);
});

for (const [system, chosen] of [
  ['dark', null],
  ['light', 'dark'],
  ['dark', 'light'],
] as const) {
  test(`search contrast follows system ${system} and chosen ${chosen ?? 'system'}`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: system });
    if (chosen)
      await page.addInitScript((value) => localStorage.setItem('a2z-theme', value), chosen);
    await page.goto('/search/?q=Cloudflare');
    await expect(page.locator('.pagefind-ui__result-link').first()).toBeVisible();
    const ratios = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext('2d')!;
      const rgb = (value: string) => {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = value;
        ctx.fillRect(0, 0, 1, 1);
        return [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3);
      };
      const luminance = (values: number[]) =>
        values
          .map((v) => {
            const c = v / 255;
            return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
          })
          .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i]!, 0);
      const background = rgb(getComputedStyle(document.body).backgroundColor);
      return [
        '.pagefind-ui__result-link',
        '.pagefind-ui__result-excerpt',
        '.pagefind-ui__message',
        '.pagefind-ui__search-input',
      ].map((selector) => {
        const el = document.querySelector(selector)!;
        const style = getComputedStyle(el);
        const opacity = Number(style.opacity);
        const foreground = rgb(style.color).map(
          (v, i) => v * opacity + background[i]! * (1 - opacity),
        );
        const a = luminance(foreground),
          b = luminance(background);
        return { selector, ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) };
      });
    });
    for (const { selector, ratio } of ratios)
      expect(ratio, selector).toBeGreaterThanOrEqual(4.5);
  });
}

test('article IDs are unique and a mobile contents jump clears the sticky header', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(article);
  const duplicates = await page.locator('[id]').evaluateAll((els) => {
    const ids = els.map((el) => el.id);
    return ids.filter((id, index) => ids.indexOf(id) !== index);
  });
  expect(duplicates).toEqual([]);
  const toc = page.locator('[data-toc-details]:visible');
  await expect(toc).not.toHaveAttribute('open', '');
  await toc.locator('summary').click();
  const link = toc.locator('a').first();
  const hash = await link.getAttribute('href');
  await link.click();
  const target = page.locator(hash!);
  await expect(target).toBeInViewport();
  await expect.poll(async () => (await target.boundingBox())!.y).toBeGreaterThanOrEqual(56);
});

test('reading options fit on a phone and remember the selected text size', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(article);
  const options = page.getByRole('button', { name: 'Options', exact: true });
  await expect(options).toBeInViewport();
  await options.click();
  for (const name of ['Larger text', 'Smaller text', 'Slower', 'Faster'])
    await expect(page.getByRole('button', { name, exact: true })).toBeInViewport();
  const before = await page
    .locator('.prose-article')
    .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  await page.getByRole('button', { name: 'Larger text', exact: true }).click();
  await expect(page.locator('[data-size-label]')).toHaveText('110%');
  const after = await page
    .locator('.prose-article')
    .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(after).toBeGreaterThan(before);
  await page.reload();
  await options.click();
  await expect(page.locator('[data-size-label]')).toHaveText('110%');
  await page.keyboard.press('Escape');
  await expect(options).toHaveAttribute('aria-expanded', 'false');
});

test('collection lists describe links present in the rendered catalogue', async ({
  page,
}) => {
  for (const path of ['/', '/topics/', '/topics/automation/']) {
    await page.goto(path);
    const schemas = (
      await page.locator('script[type="application/ld+json"]').allTextContents()
    ).map((text) => JSON.parse(text));
    const collection = schemas.find((node) => node['@type'] === 'CollectionPage');
    const items: { url: string; position: number }[] =
      collection.mainEntity.itemListElement;
    expect(collection.mainEntity.numberOfItems).toBe(items.length);
    expect(new Set(items.map((item) => item.url)).size).toBe(items.length);
    for (const [index, item] of items.entries()) {
      expect(item.position).toBe(index + 1);
      expect(
        await page.locator(`main a[href="${new URL(item.url).pathname}"]`).count(),
      ).toBeGreaterThan(0);
    }
  }
});
