import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtempSync,
  cpSync,
  symlinkSync,
  readFileSync,
  writeFileSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { checkArticle } from '../../src/lib/content-policy';
import { splitPost, joinPost } from '../../mcp/src/posts';
import mcp from '../../mcp/src/index';

const slug = 'cloudflare-workers-custom-domain-not-working';
const original = readFileSync(`src/content/posts/${slug}/index.mdx`, 'utf8');
const parsed = splitPost(original);

test('published procedures require versions and a real body section for the test record', () => {
  const post = { ...parsed.frontmatter, testedOn: { date: '2026-10-25', versions: {} } };
  assert.equal(checkArticle(post, parsed.body, slug).ok, false);
  const noFailureRecord = parsed.body.replace(/<WhatBroke>[\s\S]*?<\/WhatBroke>/, '');
  assert.match(
    checkArticle(parsed.frontmatter, noFailureRecord, slug).problems.join(' '),
    /WhatBroke/,
  );
});

test('metadata cannot bypass publication limits through unexpected types', () => {
  assert.equal(
    checkArticle({ ...parsed.frontmatter, draft: 'false' }, parsed.body, slug).ok,
    false,
  );
  assert.equal(
    checkArticle({ ...parsed.frontmatter, publishedAt: 'invalid' }, parsed.body, slug).ok,
    false,
  );
});

test('MCP update and publish refuse invalid content before any GitHub write', async () => {
  const originalFetch = globalThis.fetch;
  let writes = 0;
  globalThis.fetch = async (input, init) => {
    const path = new URL(String(input)).pathname;
    if (init?.method === 'PUT' || init?.method === 'PATCH' || init?.method === 'POST') {
      writes += 1;
      throw new Error('Unexpected remote mutation');
    }
    if (path.endsWith('/contents/src/content/posts'))
      return Response.json([{ name: slug, type: 'dir' }]);
    if (path.endsWith('/contents/src/content/authors'))
      return Response.json([{ name: 'devchandra-shrestha.json' }]);
    if (path.endsWith('/contents/src/content/pages')) return Response.json([]);
    const text = path.endsWith('/public/_redirects')
      ? ''
      : original + '\n\nIt is important to note this invalid prose.\n';
    return Response.json({
      content: Buffer.from(text).toString('base64'),
      sha: 'unit-test',
    });
  };
  try {
    for (const name of ['update_post', 'publish_post']) {
      const response = await mcp.fetch(
        new Request('https://unit.test/', {
          method: 'POST',
          headers: { Authorization: 'Bearer unit-test' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/call',
            params: { name, arguments: { slug } },
          }),
        }),
        { MCP_TOKEN: 'unit-test', GITHUB_TOKEN: 'unit-test' },
      );
      const reply = (await response.json()) as {
        result: { isError?: boolean; content: { text: string }[] };
      };
      assert.equal(reply.result.isError, true);
      assert.match(reply.result.content[0]!.text, /Banned phrase/);
    }
    assert.equal(writes, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('the actual build command rejects a bad published article before Astro runs', () => {
  const fixture = mkdtempSync(join(tmpdir(), 'a2z-build-gate-'));
  try {
    cpSync('src/content', join(fixture, 'src/content'), { recursive: true });
    symlinkSync(resolve('scripts'), join(fixture, 'scripts'), 'dir');
    symlinkSync(resolve('node_modules'), join(fixture, 'node_modules'), 'dir');
    cpSync('package.json', join(fixture, 'package.json'));
    const post = splitPost(original);
    writeFileSync(
      join(fixture, `src/content/posts/${slug}/index.mdx`),
      joinPost(
        post.frontmatter,
        post.body + '\n\nIt is important to note this invalid prose.\n',
      ),
    );
    const result = spawnSync('npm', ['run', 'build'], {
      cwd: fixture,
      encoding: 'utf8',
      env: { ...process.env, INDEXNOW_KEY: '' },
      timeout: 30000,
    });
    assert.equal(result.status, 1);
    assert.match(result.stdout + result.stderr, /Banned phrase/);
    assert.doesNotMatch(result.stdout + result.stderr, /Getting diagnostics/);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

test('a valid MCP edit still commits after resolving real repository references', async () => {
  const originalFetch = globalThis.fetch;
  let writes = 0;
  globalThis.fetch = async (input, init) => {
    const path = decodeURIComponent(
      new URL(String(input)).pathname.split('/contents/')[1] ?? '',
    );
    if (init?.method === 'PUT') {
      writes += 1;
      return Response.json({
        commit: { sha: 'abcdef123456', html_url: 'https://unit.test/commit' },
      });
    }
    if (!existsSync(path)) return Response.json({ message: 'Not found' }, { status: 404 });
    if (statSync(path).isDirectory())
      return Response.json(
        readdirSync(path).map((name) => ({
          name,
          type: statSync(join(path, name)).isDirectory() ? 'dir' : 'file',
        })),
      );
    return Response.json({
      content: readFileSync(path).toString('base64'),
      sha: 'unit-test',
    });
  };
  try {
    const response = await mcp.fetch(
      new Request('https://unit.test/', {
        method: 'POST',
        headers: { Authorization: 'Bearer unit-test' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'tools/call',
          params: {
            name: 'update_post',
            arguments: { slug, message: 'Unit fixture only' },
          },
        }),
      }),
      { MCP_TOKEN: 'unit-test', GITHUB_TOKEN: 'unit-test' },
    );
    const reply = (await response.json()) as {
      result: { isError?: boolean; content: { text: string }[] };
    };
    assert.notEqual(reply.result.isError, true, reply.result.content[0]?.text);
    assert.equal(writes, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('generic writes reject article paths even with redundant dot segments', async () => {
  const originalFetch = globalThis.fetch;
  let attempts = 0;
  globalThis.fetch = async () => {
    attempts += 1;
    throw new Error('No network expected');
  };
  try {
    for (const path of [
      'src/content/posts/example/index.mdx',
      './src/content/posts/example/index.mdx',
      'src//content/posts/example/index.mdx',
    ]) {
      const response = await mcp.fetch(
        new Request('https://unit.test/', {
          method: 'POST',
          headers: { Authorization: 'Bearer unit-test' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 3,
            method: 'tools/call',
            params: { name: 'write_repo_file', arguments: { path, content: 'invalid' } },
          }),
        }),
        { MCP_TOKEN: 'unit-test', GITHUB_TOKEN: 'unit-test' },
      );
      const result = (await response.json()) as {
        result: { isError?: boolean; content: { text: string }[] };
      };
      assert.equal(result.result.isError, true);
      assert.match(result.result.content[0]!.text, /Use the post tools/);
    }
    assert.equal(attempts, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
