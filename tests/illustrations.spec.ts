import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';

const assets: { slug: string; path: string }[] = readdirSync('docs/design')
  .filter((name) => /^art-assets-\d{4}-\d{2}-\d{2}\.json$/.test(name))
  .sort()
  .flatMap((name) => JSON.parse(readFileSync(`docs/design/${name}`, 'utf8')));
const articles = assets.filter((asset) => asset.slug !== 'home');

test('each published article has a readable, responsive illustration', async ({
  page,
  request,
}) => {
  for (const { slug } of articles) {
    await page.goto(`/${slug}/`);
    const image = page.locator('[data-article-art] img');
    await expect(image).toHaveCount(1);
    expect((await image.getAttribute('alt'))!.length).toBeGreaterThan(12);
    expect(Number(await image.getAttribute('width'))).toBeGreaterThan(0);
    expect(Number(await image.getAttribute('height'))).toBeGreaterThan(0);
    await expect(page.locator('[data-article-art] source[type="image/avif"]')).toHaveCount(
      1,
    );
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0),
      )
      .toBe(true);
    const response = await request.get((await image.getAttribute('src'))!);
    expect(response.ok(), slug).toBe(true);
    expect(response.headers()['content-type']).toMatch(/^image\//);
    await expect(page.getByText('Editorial illustration', { exact: true })).toBeVisible();
  }
});

test('the image sitemap references all current article covers', async ({ request }) => {
  const xml = await (await request.get('/sitemap-0.xml')).text();
  expect(xml).toContain('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"');
  const images = [...xml.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)].map(
    (match) => match[1]!,
  );
  expect(images).toHaveLength(articles.length);
  expect(new Set(images).size).toBe(articles.length);
  for (const url of images) {
    expect(new URL(url).origin).toBe('https://a2zskillsewa.com');
    const response = await request.get(new URL(url).pathname);
    expect(response.status(), url).toBe(200);
    expect(response.headers()['content-type']).toMatch(/^image\//);
  }
  expect(xml).not.toContain('n8n-vs-make-vs-zapier');
});

test('reading uses a comfortable sans-serif without downloading the old serif', async ({
  page,
}) => {
  const fonts: string[] = [];
  page.on('request', (request) => {
    if (request.resourceType() === 'font') fonts.push(request.url());
  });
  await page.goto('/self-host-n8n-coolify/');
  const style = await page.locator('.prose-article').evaluate((el) => {
    const s = getComputedStyle(el);
    return {
      family: s.fontFamily,
      size: parseFloat(s.fontSize),
      leading: parseFloat(s.lineHeight),
      width: el.getBoundingClientRect().width,
    };
  });
  expect(style.family).toContain('sans-serif');
  expect(style.family).not.toMatch(/Literata|Georgia|Times/);
  expect(style.size).toBeGreaterThanOrEqual(18);
  expect(style.leading / style.size).toBeGreaterThanOrEqual(1.7);
  expect(style.width).toBeLessThanOrEqual(640);
  expect(fonts.some((url) => url.includes('literata'))).toBe(false);
  await expect(page.locator('link[rel="preload"][href*="literata"]')).toHaveCount(0);
});

test('sharing images are unique, accessible and match their declared dimensions', async ({
  page,
  baseURL,
}) => {
  const urls = new Set<string>();
  for (const path of ['/', ...articles.map((asset) => `/${asset.slug}/`)]) {
    await page.goto(path);
    const url = (await page.locator('meta[property="og:image"]').getAttribute('content'))!;
    urls.add(url);
    expect(
      (await page.locator('meta[property="og:image:alt"]').getAttribute('content'))!.length,
    ).toBeGreaterThan(12);
    const size = await page.evaluate(
      async (url) => {
        const image = new Image();
        image.src = url;
        await image.decode();
        return { width: image.naturalWidth, height: image.naturalHeight };
      },
      new URL(new URL(url).pathname, baseURL).href,
    );
    expect(size).toEqual({ width: 1200, height: 630 });
    if (path !== '/') {
      const nodes = (
        await page.locator('script[type="application/ld+json"]').allTextContents()
      ).map((text) => JSON.parse(text));
      expect(nodes.find((node) => node['@type'] === 'BlogPosting').image).toBe(url);
    }
  }
  expect(urls.size).toBe(assets.length);
});

test('the homepage and topic pages have real image elements before JavaScript runs', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(baseURL!);
    await expect(page.locator('[data-home-art]')).toBeVisible();
    expect(await page.locator('[data-guide-list] picture').count()).toBe(articles.length);
    for (const path of ['/topics/', '/topics/automation/', '/topics/websites-hosting/']) {
      await page.goto(new URL(path, baseURL).href);
      expect(await page.locator('main picture').count()).toBeGreaterThan(0);
    }
  } finally {
    await context.close();
  }
});
