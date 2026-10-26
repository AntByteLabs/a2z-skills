import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const paths = [
  ...readFileSync('dist/sitemap-0.xml', 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g),
].map((match) => new URL(match[1]!).pathname);

test('a homepage search preserves its query and returns a relevant article', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.locator('#home-q').click();
  await page.locator('#home-q').fill('n8n');
  await page.locator('#home-q').press('Enter');
  await expect(page).toHaveURL(/\/search\/\?q=n8n/);
  await expect(page.locator('.pagefind-ui__search-input')).toHaveValue('n8n');
  await expect(
    page
      .locator('.pagefind-ui__result-link')
      .filter({ hasText: 'Self-host n8n on Coolify' })
      .first(),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test('search initialises from focus and keeps a shareable query when typing', async ({
  page,
}) => {
  await page.goto('/search/');
  await page.locator('#search-input').focus();
  const input = page.locator('.pagefind-ui__search-input');
  await input.fill('domain');
  await expect(page).toHaveURL(/q=domain/);
  await expect(page.locator('.pagefind-ui__result-link').first()).toBeVisible();
});

test('every sitemap URL is canonical and indexable', async ({ request }) => {
  for (const path of paths) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    const html = await response.text();
    expect(html, path).toContain(`rel="canonical" href="https://a2zskillsewa.com${path}"`);
    expect(html, path).not.toMatch(/name="robots" content="[^"]*noindex/);
  }
});

test('utility pages can be crawled to read noindex, and sparse tags stay excluded', async ({
  page,
  request,
}) => {
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).not.toContain('Disallow: /search/');
  expect(robots).not.toContain('Disallow: /thanks/');
  for (const path of ['/search/', '/thanks/', '/tags/n8n/']) {
    await page.goto(path);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, follow',
    );
    expect(paths).not.toContain(path);
  }
});

test('research and tested article labels agree with the available evidence', async ({
  page,
}) => {
  await page.goto('/phone-storage-full-after-deleting-photos/');
  await expect(page.locator('[data-research-note]')).toBeVisible();
  await expect(page.getByText('Correction, 26 October 2026')).toBeVisible();
  await page.goto('/self-host-n8n-coolify/');
  await expect(page.locator('[data-research-note]')).toHaveCount(0);
  await expect(
    page.getByRole('heading', { name: 'What this setup covers', exact: true }),
  ).toBeVisible();
});

test('the homepage title contains the brand once', async ({ page }) => {
  await page.goto('/');
  expect((await page.title()).match(/A2Z Skills/g)).toHaveLength(1);
});

test('search runs with the deployed content security policy', async ({ page }) => {
  const response = await page.goto('/search/?q=n8n');
  const policy = response?.headers()['content-security-policy'] ?? '';
  expect(policy).toContain("'wasm-unsafe-eval'");
  expect(policy).not.toMatch(/(?:^|\s)'unsafe-eval'(?:\s|;)/);
  await expect(
    page
      .locator('.pagefind-ui__result-link')
      .filter({ hasText: 'Self-host n8n on Coolify' })
      .first(),
  ).toBeVisible();
});
