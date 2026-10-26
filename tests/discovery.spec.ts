import { test, expect } from '@playwright/test';
import { firstPostPath } from './helpers';

const postPath = firstPostPath();

/**
 * The files search engines and answer engines read. None of them is visible to
 * a reader, so nothing but a test notices when one breaks.
 */
test.describe('what crawlers are served', () => {
  test('robots.txt points at the sitemap and names the answer engines', async ({
    request,
  }) => {
    const res = await request.get('/robots.txt');
    expect(res.ok()).toBeTruthy();
    const body = await res.text();

    expect(body).toContain('Sitemap: https://a2zskillsewa.com/sitemap-index.xml');
    // These two only read a site that says yes, so silence would cost us.
    expect(body).toContain('Google-Extended');
    expect(body).toContain('Applebot-Extended');
    for (const bot of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'CCBot']) {
      expect(body, `${bot} should be addressed`).toContain(bot);
    }
    // Affiliate redirects and the API stay out of every index.
    expect(body).toContain('Disallow: /go/');
    expect(body).toContain('Disallow: /api/');
  });

  test('the sitemap index points at a sitemap that carries lastmod', async ({
    request,
  }) => {
    const index = await request.get('/sitemap-index.xml');
    expect(index.ok()).toBeTruthy();
    expect(await index.text()).toContain('/sitemap-0.xml');

    const map = await request.get('/sitemap-0.xml');
    expect(map.ok()).toBeTruthy();
    const xml = await map.text();

    const urls = xml.match(/<loc>/g) ?? [];
    const dates = xml.match(/<lastmod>/g) ?? [];
    expect(urls.length).toBeGreaterThan(5);
    // Freshness is the signal; a sitemap without dates throws it away.
    expect(dates.length).toBeGreaterThan(0);
    expect(xml).not.toContain('/search/');
    expect(xml).not.toContain('/thanks/');
    expect(xml).not.toContain('/go/');
  });

  test('both llms files are served and carry the tested-on facts', async ({ request }) => {
    const short = await request.get('/llms.txt');
    expect(short.ok()).toBeTruthy();
    const shortBody = await short.text();
    expect(shortBody).toContain('## Guides');
    expect(shortBody).toContain('/llms-full.txt');

    const full = await request.get('/llms-full.txt');
    expect(full.ok()).toBeTruthy();
    const fullBody = await full.text();
    expect(fullBody.length).toBeGreaterThan(1000);
    expect(fullBody).toContain('Source: https://a2zskillsewa.com/');
  });

  test('the structured data graph has no dangling publisher', async ({ page }) => {
    test.skip(!postPath, 'no posts in this build');
    await page.goto(postPath!);
    const graphs = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    const nodes = graphs.flatMap((g) => {
      const parsed = JSON.parse(g);
      return parsed['@graph'] ?? [parsed];
    });
    const types = nodes.map((n: { '@type': string }) => n['@type']);

    expect(types).toContain('WebSite');
    expect(types).toContain('BlogPosting');
    expect(types).toContain('BreadcrumbList');
    // The publisher was referenced by @id and never emitted. Never again.
    expect(types, 'Organization must exist, not just be referenced').toContain(
      'Organization',
    );

    const org = nodes.find((n: { '@type': string }) => n['@type'] === 'Organization');
    const article = nodes.find((n: { '@type': string }) => n['@type'] === 'BlogPosting');
    expect(article.publisher['@id']).toBe(org['@id']);
  });

  test('the FAQ is marked up, and only where a reader can see it', async ({ page }) => {
    test.skip(!postPath, 'no posts in this build');
    await page.goto(postPath!);

    const nodes = (
      await page.locator('script[type="application/ld+json"]').allTextContents()
    ).flatMap((g) => {
      const parsed = JSON.parse(g);
      return parsed['@graph'] ?? [parsed];
    });
    const faq = nodes.find((n: { '@type': string }) => n['@type'] === 'FAQPage');

    // A post without an FAQ must not emit an empty one.
    const visible = page.locator('#faq, [data-faq]');
    if ((await visible.count()) === 0) {
      expect(faq, 'no FAQ on the page, so no FAQPage in the markup').toBeUndefined();
      return;
    }

    expect(faq).toBeTruthy();
    expect(faq.mainEntity.length).toBeGreaterThan(0);

    // Marking up an answer the reader cannot find is what the guidelines forbid.
    const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    for (const q of faq.mainEntity) {
      expect(q['@type']).toBe('Question');
      expect(q.acceptedAnswer.text.length).toBeGreaterThan(0);
      expect(body, `the page must show: ${q.name}`).toContain(q.name.replace(/\s+/g, ' '));
    }
  });

  test('the feed is served and lists the posts', async ({ request }) => {
    const res = await request.get('/rss.xml');
    expect(res.ok()).toBeTruthy();
    const body = await res.text();
    expect(body).toContain('<rss');
    expect(body).toContain('a2zskillsewa.com');
  });
});
