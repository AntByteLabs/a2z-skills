import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import { livePosts, postPath } from '../lib/posts';
import { site } from '../site';

/**
 * Every published guide in full, in one plain-text file, so an answer engine
 * can read the whole corpus without crawling and without rendering. The
 * component tags are stripped: what is left is the prose, the commands and the
 * errors, which is the part worth quoting.
 */
const toPlainText = (mdx: string) =>
  mdx
    .replace(/^import .*$/gm, '')
    .replace(
      /<\/?(Steps|Step|Callout|WhatBroke|ComparisonTable|ToolCard|AdSlot)[^>]*>/g,
      '',
    )
    .replace(/\n{3,}/g, '\n\n')
    .trim();

export const GET: APIRoute = async () => {
  const posts = await livePosts();
  const out: string[] = [
    `# ${site.name} — every guide in full`,
    '',
    `> ${site.description}`,
    '',
    `Generated ${new Date().toISOString().slice(0, 10)}. ${posts.length} guide(s).`,
    'Tested procedures include versions and a test date. Explainers link to sources.',
    'Keep test dates with claims taken from a procedure, and link the source page.',
    '',
    '---',
    '',
  ];

  for (const post of posts) {
    const author = await getEntry(post.data.author);
    const tested = post.data.testedOn;
    out.push(`# ${post.data.title}`);
    out.push('');
    out.push(`Source: ${site.url}${postPath(post)}`);
    if (author) out.push(`Author: ${author.data.name}, ${author.data.role}`);
    if (tested) {
      out.push(
        `Tested: ${tested.date.toISOString().slice(0, 10)} on ${Object.entries(
          tested.versions,
        )
          .map(([k, v]) => `${k} ${v}`)
          .join(', ')}${tested.device ? `, ${tested.device}` : ''}`,
      );
    }
    out.push('');
    out.push(`Short answer: ${post.data.quickAnswer.replace(/\s+/g, ' ')}`);
    out.push('');
    out.push(toPlainText(post.body ?? ''));
    if (post.data.faq.length) {
      out.push('', '## Questions people also ask', '');
      for (const item of post.data.faq) out.push(`Q: ${item.q}`, `A: ${item.a}`, '');
    }
    out.push('', '---', '');
  }

  return new Response(out.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
