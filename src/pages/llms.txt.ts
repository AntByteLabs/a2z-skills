import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { livePosts, postPath } from '../lib/posts';
import { site } from '../site';

/** A plain-text map of the site for AI crawlers. Built from real content. */
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
    'Every how-to, fix and review on this site was run on a real machine before publishing.',
    'Each post lists the software versions it was tested on and the date of the test.',
    '',
    '## Topics',
    '',
    ...pillars.map(
      (p) => `- [${p.data.name}](${site.url}/topics/${p.id}/): ${p.data.description}`,
    ),
    '',
    '## Guides',
    '',
    ...posts.map(
      (p) =>
        `- [${p.data.title}](${site.url}${postPath(p)}): ${p.data.quickAnswer.replace(/\s+/g, ' ')}`,
    ),
    '',
    '## About',
    '',
    `- [Editorial policy](${site.url}/editorial-policy/): how guides are tested and corrected.`,
    `- [Affiliate disclosure](${site.url}/affiliate-disclosure/)`,
    `- Contact: ${site.email}`,
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
