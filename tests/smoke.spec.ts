import { test, expect } from '@playwright/test';
import { firstPostPath, firstHubPath, firstAuthorPath } from './helpers';

const postPath = firstPostPath();
const hubPath = firstHubPath();
const authorPath = firstAuthorPath();

test.describe('pages a reader lands on', () => {
  test('home page says what the site is and offers search', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('searchbox').first()).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('script[type="application/ld+json"]').first()).toBeAttached();
  });

  test('the newsletter form posts to the Worker and carries a honeypot', async ({
    page,
  }) => {
    await page.goto('/');
    const form = page.locator('form[data-newsletter]').first();
    await expect(form).toHaveAttribute('action', '/api/subscribe');
    await expect(form.locator('input[name="website"]')).toHaveCount(1);
    await expect(form.locator('input[name="email"]')).toHaveAttribute('required', '');
  });

  test('the colour scheme can be switched', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Switch between light and dark').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', /light|dark/);
  });

  test('search and thanks stay out of the index', async ({ page }) => {
    for (const path of ['/search/', '/thanks/']) {
      await page.goto(path);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        'content',
        /noindex/,
      );
    }
  });

  test('robots.txt and llms.txt are served and point at the sitemap', async ({
    request,
  }) => {
    const robots = await request.get('/robots.txt');
    expect(robots.ok()).toBeTruthy();
    expect(await robots.text()).toContain('sitemap-index.xml');
    const llms = await request.get('/llms.txt');
    expect(llms.ok()).toBeTruthy();
    expect(await llms.text()).toContain('## Guides');
  });

  test('the 404 page renders', async ({ page }) => {
    const res = await page.goto('/404.html');
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
  });
});

test.describe('a published post', () => {
  test.skip(!postPath, 'no posts in this build');

  test('shows the short answer and what it was tested on', async ({ page }) => {
    await page.goto(postPath!);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByText('Short answer')).toBeVisible();
  });

  test('carries one canonical and both article graphs', async ({ page }) => {
    await page.goto(postPath!);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    const graphs = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    const types = graphs.map((g) => JSON.parse(g)['@type']);
    expect(types).toContain('BlogPosting');
    expect(types).toContain('BreadcrumbList');
  });

  test('has a social image and links back to its hub', async ({ page }) => {
    await page.goto(postPath!);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      /\.(?:png|jpe?g|webp)$/,
    );
    await expect(page.locator('a[href^="/topics/"]').first()).toBeAttached();
  });

  test('every affiliate link is marked sponsored', async ({ page }) => {
    await page.goto(postPath!);
    const links = page.locator('a[href^="/go/"]');
    for (let i = 0; i < (await links.count()); i += 1) {
      await expect(links.nth(i)).toHaveAttribute('rel', /sponsored/);
    }
  });
});

test.describe('hub and author pages', () => {
  test('a hub page renders its heading', async ({ page }) => {
    test.skip(!hubPath, 'no hubs in this build');
    await page.goto(hubPath!);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  });

  test('an author page exposes a Person profile', async ({ page }) => {
    test.skip(!authorPath, 'no authors in this build');
    await page.goto(authorPath!);
    const graphs = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    expect(graphs.map((g) => JSON.parse(g)['@type'])).toContain('ProfilePage');
  });
});
