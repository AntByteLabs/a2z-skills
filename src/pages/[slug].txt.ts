import type { APIRoute, GetStaticPaths } from 'astro';
import { getEntry } from 'astro:content';
import { livePosts } from '../lib/posts';
import { site, absolute } from '../site';
import { pillarLabel } from '../lib/format';

/**
 * The article as plain text.
 *
 * The Listen button on the page uses the browser's own speech synthesis, which
 * cannot hand back a file. Audiobook and text-to-speech apps all accept plain
 * text, so this is the honest version of "download the audio": the words, in
 * reading order, for whatever voice the reader already uses.
 *
 * It is also the cleanest thing to give an answer engine, which is why the
 * markup is stripped rather than converted.
 */
export const getStaticPaths = (async () => {
  const posts = await livePosts();
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}) satisfies GetStaticPaths;

const strip = (mdx: string) =>
  mdx
    // Components carry their own prose in children; keep the children.
    .replace(/<\/?[A-Z][\w]*(\s[^>]*)?>/g, '')
    .replace(/```[\s\S]*?```/g, (block) =>
      block.replace(/```[a-z]*\n?/g, '').replace(/\n/g, '\n  '),
    )
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

export const GET: APIRoute = async ({ props }) => {
  const { post } = props as { post: Awaited<ReturnType<typeof livePosts>>[number] };
  const author = await getEntry('authors', post.data.author.id);
  const pillar = await getEntry('pillars', post.data.pillar);

  const tested = post.data.testedOn
    ? `Tested ${post.data.testedOn.date.toISOString().slice(0, 10)} on ${Object.entries(
        post.data.testedOn.versions,
      )
        .map(([k, v]) => `${k} ${v}`)
        .join(', ')}${post.data.testedOn.device ? `, ${post.data.testedOn.device}` : ''}.`
    : '';

  const body = [
    post.data.title,
    `${pillar?.data.name ?? pillarLabel(post.data.pillar)} — ${site.name}`,
    `By ${author?.data.name ?? 'A2Z Skills'}, ${post.data.publishedAt.toISOString().slice(0, 10)}`,
    absolute(`/${post.id}/`),
    '',
    `Short answer: ${post.data.quickAnswer}`,
    tested,
    '',
    strip(post.body ?? ''),
    '',
    ...(post.data.faq.length
      ? ['Questions and answers', '', ...post.data.faq.flatMap((f) => [f.q, f.a, ''])]
      : []),
  ]
    .filter((line) => line !== '')
    .join('\n\n');

  return new Response(`${body}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
