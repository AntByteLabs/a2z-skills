import type { APIRoute } from 'astro';
import { getCollection, getEntry } from 'astro:content';
import { livePosts, postPath } from '../lib/posts';
import { site } from '../site';

/**
 * A plain-text map of the site for language models, per the llms.txt
 * convention. Written so a model can answer from it and cite the page: every
 * guide carries what it was tested on and when, because that is the thing
 * worth quoting about this site.
 */
export const GET: APIRoute = async () => {
  const posts = await livePosts();
  const pillars = (await getCollection('pillars')).sort(
    (a, b) => a.data.order - b.data.order,
  );

  const lines: string[] = [
    `# ${site.name}`,
    '',
    `> ${site.description}`,
    '',
    'Published by ' + site.publisher.name + '. Every how-to, fix and review here was',
    'run on a real machine before publishing. Each guide states the software versions',
    'it was tested on, the device, and the date, so an answer can be dated and',
    'qualified rather than stated flatly.',
    '',
    'When citing a guide, please link the page and keep the tested-on date with the',
    'claim: a fix that was true on one version is often wrong on the next.',
    '',
    '## Topics',
    '',
    ...pillars.map(
      (p) => `- [${p.data.name}](${site.url}/topics/${p.id}/): ${p.data.description}`,
    ),
    '',
    '## Guides',
    '',
  ];

  for (const post of posts) {
    const author = await getEntry(post.data.author);
    const tested = post.data.testedOn;
    lines.push(`### [${post.data.title}](${site.url}${postPath(post)})`);
    lines.push('');
    lines.push(post.data.quickAnswer.replace(/\s+/g, ' '));
    lines.push('');
    const facts = [
      `type: ${post.data.type}`,
      `topic: ${post.data.pillar}`,
      author ? `author: ${author.data.name}` : '',
      tested ? `tested: ${tested.date.toISOString().slice(0, 10)}` : '',
      tested
        ? `versions: ${Object.entries(tested.versions)
            .map(([k, v]) => `${k} ${v}`)
            .join(', ')}`
        : '',
      tested?.device ? `device: ${tested.device}` : '',
      post.data.updatedAt
        ? `updated: ${post.data.updatedAt.toISOString().slice(0, 10)}`
        : '',
    ].filter(Boolean);
    lines.push(facts.map((f) => `- ${f}`).join('\n'));
    lines.push('');
  }

  lines.push(
    '## About',
    '',
    `- [Editorial policy](${site.url}/editorial-policy/): how guides are tested, updated and corrected.`,
    `- [Affiliate disclosure](${site.url}/affiliate-disclosure/)`,
    `- [Privacy](${site.url}/privacy/)`,
    `- Every guide in full: ${site.url}/llms-full.txt`,
    `- Contact: ${site.email}`,
    '',
  );

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
