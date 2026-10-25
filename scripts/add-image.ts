/**
 * npm run image -- <slug> <public-image-url> "alt text" [--name hero]
 *
 * Pulls an image from a public URL (a generated hero, a screenshot host),
 * checks it really is an image, re-encodes it, strips metadata and saves it
 * beside the post. Astro's build then produces the AVIF/WebP sizes.
 *
 * A downloaded file is untrusted: the bytes are validated before they are
 * written, nothing is executed, and the destination is always inside the
 * post's own folder.
 */
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import sharp, { type Metadata } from 'sharp';
import { POSTS_DIR, yamlString, red, green, yellow, dim, bold } from './lib';

const MAX_BYTES = 20 * 1024 * 1024;
const TARGET_WIDTH = 1600;

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith('--'));
const flag = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? undefined : args[i + 1];
};

const [slug, url, alt] = positional;
const name = flag('name') ?? 'hero';

const usage = () => {
  console.error(
    red('Usage: npm run image -- <slug> <public-image-url> "alt text" [--name hero]'),
  );
  process.exit(1);
};

if (!slug || !url || !alt) usage();

const run = async () => {
  const dir = join(POSTS_DIR, slug!);
  const mdx = join(dir, 'index.mdx');
  if (!existsSync(mdx)) {
    console.error(red(`No post at src/content/posts/${slug}/index.mdx`));
    process.exit(1);
  }

  let parsed: URL;
  try {
    parsed = new URL(url!);
  } catch {
    console.error(red('That is not a URL.'));
    process.exit(1);
  }
  if (parsed.protocol !== 'https:') {
    console.error(red('Only https URLs are accepted.'));
    process.exit(1);
  }

  console.log(dim(`fetching ${parsed.host}${parsed.pathname.slice(0, 60)}…`));
  // Some hosts (Wikimedia among them) reject requests without a User-Agent.
  const res = await fetch(parsed, {
    redirect: 'follow',
    headers: {
      'User-Agent': 'a2z-skills-image-fetch/1.0 (+https://a2zskillsewa.com)',
      Accept: 'image/avif,image/webp,image/png,image/jpeg,*/*',
    },
  });
  if (!res.ok) {
    console.error(red(`The host returned ${res.status} ${res.statusText}.`));
    process.exit(1);
  }

  const type = res.headers.get('content-type') ?? '';
  if (!/^image\/(png|jpeg|webp|avif)/.test(type)) {
    console.error(red(`Content-Type is "${type || 'missing'}", not an image.`));
    process.exit(1);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.byteLength > MAX_BYTES) {
    console.error(
      red(`${(buffer.byteLength / 1024 / 1024).toFixed(1)} MB is over the 20 MB cap.`),
    );
    process.exit(1);
  }

  // Decode before trusting the header: sharp throws on anything that is not an image.
  let meta: Metadata;
  try {
    meta = await sharp(buffer).metadata();
  } catch {
    console.error(red('Those bytes could not be decoded as an image.'));
    process.exit(1);
  }
  if (!meta.width || !meta.height) {
    console.error(red('The image has no dimensions.'));
    process.exit(1);
  }
  if (meta.width < 1200) {
    console.warn(
      yellow(`${meta.width}px wide. 1600px or more keeps it sharp on a retina screen.`),
    );
  }

  const width = Math.min(meta.width, TARGET_WIDTH);
  const out = join(dir, `${name}.webp`);
  const encoded = await sharp(buffer)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 82, effort: 6 })
    .toBuffer();

  await mkdir(dir, { recursive: true });
  await writeFile(out, encoded);

  const kb = (encoded.byteLength / 1024).toFixed(0);
  console.log(green(`wrote src/content/posts/${slug}/${name}.webp (${width}px, ${kb} KB)`));

  // Point the post at it, unless it already has a hero.
  if (name === 'hero') {
    const raw = await readFile(mdx, 'utf8');
    if (/^heroImage:/m.test(raw)) {
      console.log(dim('heroImage is already set; left alone.'));
    } else {
      const patched = raw.replace(
        /^draft:/m,
        `heroImage: ./hero.webp\nheroAlt: ${yamlString(alt!)}\ndraft:`,
      );
      if (patched === raw) {
        console.log(
          yellow('Could not place heroImage automatically. Add these two lines:'),
        );
        console.log(`  heroImage: ./hero.webp`);
        console.log(`  heroAlt: ${yamlString(alt!)}`);
      } else {
        await writeFile(mdx, patched, 'utf8');
        console.log(green('set heroImage and heroAlt in the frontmatter'));
      }
    }
  } else {
    console.log(bold('\nUse it in the body:'));
    console.log(`  import ${name} from './${name}.webp';`);
    console.log(`  <Image src={${name}} alt=${yamlString(alt!)} />\n`);
  }

  console.log(dim('Alt text describes what the image shows, not that it is an image.'));
};

run().catch((error) => {
  console.error(red((error as Error).message));
  process.exit(1);
});
