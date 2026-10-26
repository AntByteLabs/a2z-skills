import { test, expect } from '@playwright/test';

test('a negative feedback note creates one submission', async ({ page }) => {
  const bodies: string[] = [];
  await page.route('**/api/feedback', async (route) => {
    bodies.push(route.request().postData() ?? '');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '{"ok":true}',
    });
  });
  await page.goto('/self-host-n8n-coolify/');
  await page.locator('[data-answer="no"]').click();
  expect(bodies).toHaveLength(0);
  await page
    .locator('[data-helpful-note] textarea')
    .fill('The expected field was absent in my version.');
  await page.locator('[data-helpful-note] button[type="submit"]').click();
  await expect(page.locator('[data-helpful-thanks]')).toBeVisible();
  expect(bodies).toHaveLength(1);
  expect(bodies[0]).toContain('The expected field was absent');
});

test('feedback failure is visible and the reader can retry', async ({ page }) => {
  let attempts = 0;
  await page.route('**/api/feedback', async (route) => {
    attempts += 1;
    await route.fulfill({
      status: attempts === 1 ? 500 : 200,
      contentType: 'application/json',
      body: attempts === 1 ? '{"error":"Unavailable"}' : '{"ok":true}',
    });
  });
  await page.goto('/self-host-n8n-coolify/');
  await page.locator('[data-answer="yes"]').click();
  await expect(page.locator('[data-helpful-error]')).toBeVisible();
  await expect(page.locator('[data-helpful-thanks]')).toBeHidden();
  await page.locator('[data-answer="yes"]').click();
  await expect(page.locator('[data-helpful-thanks]')).toBeVisible();
  expect(attempts).toBe(2);
});

test('a blank optional note can be sent without creating a second vote', async ({
  page,
}) => {
  let requests = 0;
  await page.route('**/api/feedback', async (route) => {
    requests += 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '{"ok":true}',
    });
  });
  await page.goto('/self-host-n8n-coolify/');
  await page.locator('[data-answer="no"]').click();
  await page.locator('[data-helpful-note] button[type="submit"]').click();
  await expect(page.locator('[data-helpful-thanks]')).toBeVisible();
  expect(requests).toBe(1);
});

test('newsletter success requests JSON and accurately describes the saved address', async ({
  page,
}) => {
  let accept = '';
  await page.route('https://challenges.cloudflare.com/turnstile/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: 'window.turnstile={render(){return "unit";},reset(){}};',
    }),
  );
  await page.route('**/api/subscribe', async (route) => {
    accept = route.request().headers()['accept'] ?? '';
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '{"ok":true}',
    });
  });
  await page.goto('/');
  const form = page.locator('form[data-newsletter]').first();
  await form.locator('input[name="email"]').fill('reader@example.test');
  await form.locator('button[type="submit"]').click();
  await expect(form.locator('[data-newsletter-ok]')).toBeVisible();
  await expect(form.locator('[data-newsletter-ok]')).toContainText('No confirmation email');
  expect(accept).toContain('application/json');
});
