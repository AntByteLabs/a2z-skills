/**
 * Page weight budget, measured the way a reader pays for it: gzip-compressed
 * transfer size, not bytes on disk. Lighthouse CI covers the timings; this
 * catches a dependency quietly doubling the CSS or JS on a page.
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';
import { ROOT, red, green, dim, bold } from './lib';

const DIST = join(ROOT, 'dist');

const BUDGET = {
  js: 30 * 1024,
  css: 25 * 1024,
  html: 60 * 1024,
};

const gz = (buf: Buffer) => gzipSync(buf, { level: 9 }).length;

const walk = async (dir: string): Promise<string[]> => {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(path)));
    else if (entry.name.endsWith('.html')) out.push(path);
  }
  return out;
};

const run = async () => {
  if (!existsSync(DIST)) {
    console.error(red('No dist/. Run the build first.'));
    process.exit(1);
  }

  const pages = await walk(DIST);
  const failures: string[] = [];
  const rows: { page: string; html: number; css: number; js: number }[] = [];

  for (const page of pages) {
    const html = await readFile(page, 'utf8');
    const rel = relative(DIST, page);

    const refs = (re: RegExp) => [...html.matchAll(re)].map((m) => m[1]!);
    const cssFiles = refs(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g);
    const jsFiles = refs(/<script[^>]+src="([^"]+)"/g);
    const inlineJs = [
      ...html.matchAll(
        /<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g,
      ),
    ]
      .map((m) => m[1]!)
      .join('\n');

    const sizeOf = async (urls: string[]) => {
      let total = 0;
      for (const url of urls) {
        if (/^https?:/.test(url)) continue;
        const path = join(DIST, url.replace(/^\//, ''));
        if (!existsSync(path)) continue;
        if ((await stat(path)).isDirectory()) continue;
        total += gz(await readFile(path));
      }
      return total;
    };

    const css = await sizeOf(cssFiles);
    const js = (await sizeOf(jsFiles)) + (inlineJs.trim() ? gz(Buffer.from(inlineJs)) : 0);
    const htmlSize = gz(Buffer.from(html));
    rows.push({ page: rel, html: htmlSize, css, js });

    if (js > BUDGET.js)
      failures.push(`${rel}: ${(js / 1024).toFixed(1)} KB JS over ${BUDGET.js / 1024} KB`);
    if (css > BUDGET.css)
      failures.push(
        `${rel}: ${(css / 1024).toFixed(1)} KB CSS over ${BUDGET.css / 1024} KB`,
      );
    if (htmlSize > BUDGET.html)
      failures.push(
        `${rel}: ${(htmlSize / 1024).toFixed(1)} KB HTML over ${BUDGET.html / 1024} KB`,
      );
  }

  const worst = [...rows]
    .sort((a, b) => b.js + b.css + b.html - (a.js + a.css + a.html))
    .slice(0, 5);
  console.log(bold('\nbudget (gzip, per page)'));
  console.log(dim('  page                                         html     css      js'));
  for (const r of worst) {
    const k = (n: number) => `${(n / 1024).toFixed(1)}K`.padStart(7);
    console.log(`  ${r.page.padEnd(42).slice(0, 42)} ${k(r.html)} ${k(r.css)} ${k(r.js)}`);
  }

  if (failures.length) {
    console.error(red(`\n${failures.length} page(s) over budget:`));
    for (const f of failures) console.error(red(`  ${f}`));
    process.exit(1);
  }
  console.log(
    green(
      `\nbudget ok — ${rows.length} page(s) inside JS ${BUDGET.js / 1024} KB, CSS ${BUDGET.css / 1024} KB\n`,
    ),
  );
};

run().catch((error) => {
  console.error(red((error as Error).message));
  process.exit(1);
});
