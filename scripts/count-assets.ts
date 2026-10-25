/**
 * Counts files in dist/ against the Workers free-plan limit of 20,000 per
 * version, and checks no single file passes the 25 MiB cap. Runs on every build.
 */
import { readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { ROOT, red, yellow, green, dim } from './lib';

const DIST = join(ROOT, 'dist');
const FREE_LIMIT = 20_000;
const WARN_AT = 16_000;
const FAIL_AT = 19_500;
const MAX_FILE = 25 * 1024 * 1024;

const walk = async (dir: string): Promise<string[]> => {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(path)));
    else out.push(path);
  }
  return out;
};

const run = async () => {
  const files = await walk(DIST);
  const oversize: { path: string; size: number }[] = [];
  let bytes = 0;

  for (const file of files) {
    const { size } = await stat(file);
    bytes += size;
    if (size > MAX_FILE) oversize.push({ path: relative(DIST, file), size });
  }

  const mb = (n: number) => `${(n / 1024 / 1024).toFixed(1)} MB`;
  console.log(
    `assets: ${files.length.toLocaleString()} files, ${mb(bytes)} ` +
      dim(`(free limit ${FREE_LIMIT.toLocaleString()} files, 25 MiB each)`),
  );

  for (const f of oversize) {
    console.error(red(`  ${f.path} is ${mb(f.size)} — over the 25 MiB per-file cap.`));
  }

  if (oversize.length) {
    console.error(red('Move large files to R2 or an external host.'));
    process.exit(1);
  }
  if (files.length >= FAIL_AT) {
    console.error(
      red(`${files.length} files is over the ${FAIL_AT.toLocaleString()} build guard.`),
    );
    console.error(
      red('Cut image widths, move images to R2, or move to Workers Paid (100,000 files).'),
    );
    process.exit(1);
  }
  if (files.length >= WARN_AT) {
    console.warn(
      yellow(
        `${files.length} files. Plan the next step before ${FREE_LIMIT.toLocaleString()}.`,
      ),
    );
    return;
  }
  console.log(green('assets ok'));
};

run().catch((error) => {
  console.error(red((error as Error).message));
  process.exit(1);
});
