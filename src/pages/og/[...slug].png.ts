import type { APIRoute, GetStaticPaths } from 'astro';
import { getEntry } from 'astro:content';
import { ogPng } from '../../lib/og';
import { livePosts } from '../../lib/posts';
import { pillarLabel } from '../../lib/format';

export const getStaticPaths = (async () => {
  const posts = await livePosts();
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const { post } = props as { post: Awaited<ReturnType<typeof livePosts>>[number] };
  const pillar = await getEntry('pillars', post.data.pillar);
  const png = await ogPng({
    title: post.data.title,
    kicker: pillar?.data.name ?? pillarLabel(post.data.pillar),
    footer: post.data.testedOn
      ? `Tested ${post.data.testedOn.date.toISOString().slice(0, 10)}`
      : undefined,
  });
  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
