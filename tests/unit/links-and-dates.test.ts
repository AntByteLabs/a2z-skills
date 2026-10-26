import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { latestDate, xmlEscape } from '../../src/lib/seo-dates';
import { checkBuiltLinks } from '../../scripts/check-links';

test('a later revision of an older post controls aggregate modification dates', () => {
  assert.equal(
    latestDate([
      new Date('2026-10-25'),
      new Date('2026-11-01'),
      new Date('2026-10-26'),
    ])?.toISOString(),
    '2026-11-01T00:00:00.000Z',
  );
  assert.equal(latestDate([undefined, new Date('invalid')]), undefined);
  assert.equal(
    xmlEscape('https://example.test/?a=1&b=<2>'),
    'https://example.test/?a=1&amp;b=&lt;2&gt;',
  );
});

test('the link gate detects a broken link inside a directory-index article', async () => {
  const root = mkdtempSync(join(tmpdir(), 'a2z-link-gate-'));
  try {
    mkdirSync(join(root, 'post'));
    writeFileSync(join(root, 'index.html'), '<a href="/post/">Article</a>');
    writeFileSync(join(root, 'post/index.html'), '<a href="/missing/">Broken</a>');
    assert.equal((await checkBuiltLinks(root)).passed, false);
    writeFileSync(join(root, 'post/index.html'), '<a href="/">Home</a>');
    assert.equal((await checkBuiltLinks(root)).passed, true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
