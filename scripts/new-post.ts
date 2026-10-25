/**
 * npm run new -- "excel xlookup not working" [--type fix] [--pillar excel-office]
 *
 * Creates the post folder, a slug that follows the rules, frontmatter with every
 * required field, and the blueprint headings. Strings are quoted because YAML
 * treats `#` as a comment and breaks on `: `.
 */
import { mkdir, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  POSTS_DIR,
  PILLARS_DIR,
  AUTHORS_DIR,
  readIds,
  slugify,
  STOP_WORDS,
  yamlString,
  isoDate,
  red,
  green,
  dim,
  bold,
} from './lib';

const args = process.argv.slice(2);
const flag = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? undefined : args[i + 1];
};
const keyword = args.filter(
  (a) => !a.startsWith('--') && args[args.indexOf(a) - 1]?.startsWith('--') !== true,
)[0];

if (!keyword) {
  console.error(
    red(
      'Usage: npm run new -- "the keyword" [--type fix] [--pillar excel-office] [--author editor]',
    ),
  );
  process.exit(1);
}

const type = flag('type') ?? 'how-to';
const TYPES = ['how-to', 'fix', 'comparison', 'review', 'explainer', 'list', 'asset'];
if (!TYPES.includes(type)) {
  console.error(red(`--type must be one of: ${TYPES.join(', ')}`));
  process.exit(1);
}

const run = async () => {
  const pillarIds = await readIds(PILLARS_DIR, '.md');
  const authorIds = await readIds(AUTHORS_DIR, '.json');
  const pillar = flag('pillar') ?? pillarIds[0]!;
  const author = flag('author') ?? authorIds[0]!;

  if (!pillarIds.includes(pillar)) {
    console.error(red(`--pillar must be one of: ${pillarIds.join(', ')}`));
    process.exit(1);
  }
  if (!authorIds.includes(author)) {
    console.error(red(`--author must be one of: ${authorIds.join(', ')}`));
    process.exit(1);
  }

  // Keyword first, no stop words, no years, 3 to 6 words.
  const words = slugify(keyword)
    .split('-')
    .filter((w) => w && !STOP_WORDS.has(w) && !/^(19|20)\d{2}$/.test(w));
  const slug = words.slice(0, 6).join('-');
  if (words.length < 3) {
    console.error(
      red(`"${slug}" is only ${words.length} word(s). Give a fuller keyword phrase.`),
    );
    process.exit(1);
  }

  const dir = join(POSTS_DIR, slug);
  if (existsSync(dir)) {
    console.error(red(`src/content/posts/${slug}/ already exists.`));
    process.exit(1);
  }

  const title = keyword.charAt(0).toUpperCase() + keyword.slice(1);
  const today = isoDate(new Date());
  const needsTest = ['how-to', 'fix', 'review'].includes(type);
  const existing = (await readdir(POSTS_DIR, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  const testedOn = needsTest
    ? `testedOn:
  date: ${today}
  versions:
    ${yamlString('Windows 11')}: ${yamlString('25H2')}
  device: ${yamlString('TODO the machine you tested on')}
`
    : '';

  const frontmatter = `---
title: ${yamlString(title)}
description: ${yamlString('TODO one sentence, 120 to 160 characters, that says what the reader gets.')}
pillar: ${pillar}
type: ${type}
tags: []
author: ${author}
publishedAt: ${today}
quickAnswer: ${yamlString('TODO the answer in two or three sentences, written so it can be quoted on its own.')}
${testedOn}faq: []
affiliates: []
downloads: []
draft: true
---
`;

  const blueprint = `
TODO one or two sentences that say who this is for and what state their machine
is in. Then link the hub and two related posts:
[${pillar}](/topics/${pillar}/)${existing.length ? `, [${existing[0]}](/${existing[0]}/)` : ''}${existing.length > 1 ? `, [${existing[1]}](/${existing[1]}/)` : ''}.

## TODO the first thing to check

<Steps>
  <Step title="TODO what the reader does">
    TODO exactly what they click or type, and what they should see back.
  </Step>
  <Step title="TODO the next thing">
    TODO the same again. One action per step.
  </Step>
</Steps>

## TODO the fix itself

TODO the working answer, with the real menu path and the real command.

<Callout type="tip">
  TODO the shortcut you found while testing, or delete this block.
</Callout>

## TODO what to do if that did not work

TODO the second route, for the reader the first one failed on.

<WhatBroke>
  TODO the errors you actually hit while testing: what the screen said, what
  caused it, and what fixed it. This section is why the post is worth reading.
</WhatBroke>
`;

  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'index.mdx'), frontmatter + blueprint, 'utf8');

  console.log(green(`\nCreated src/content/posts/${slug}/index.mdx`));
  console.log(bold('\nNext:'));
  console.log(`  1. Test it for real. Record versions, device, date and every error.`);
  console.log(`  2. Fill the TODOs. ${dim('validate fails while any TODO remains.')}`);
  console.log(`  3. npm run suggest-links -- ${slug}`);
  console.log(`  4. npm run validate && npm run build`);
  console.log(`  5. Set draft: false, open a PR on branch post/${slug}\n`);
};

run().catch((error) => {
  console.error(red((error as Error).message));
  process.exit(1);
});
