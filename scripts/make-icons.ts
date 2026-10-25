/**
 * Renders the PNG icons the head tags and Organization schema reference, from
 * public/favicon.svg. Run after changing the logo: tsx scripts/make-icons.ts
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import { ROOT, green } from './lib';

const SVG = join(ROOT, 'public/favicon.svg');

const sizes: { file: string; width: number; background: string }[] = [
  { file: 'apple-touch-icon.png', width: 180, background: '#1b2436' },
  { file: 'logo.png', width: 512, background: '#1b2436' },
];

const run = async () => {
  const svg = await readFile(SVG, 'utf8');
  for (const { file, width, background } of sizes) {
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: width }, background })
      .render()
      .asPng();
    await writeFile(join(ROOT, 'public', file), png);
    console.log(green(`public/${file} (${width}px, ${(png.length / 1024).toFixed(1)} KB)`));
  }
};

run();
