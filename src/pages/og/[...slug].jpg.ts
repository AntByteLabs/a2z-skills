import type { APIRoute, GetStaticPaths } from 'astro';
import { getEntry } from 'astro:content';
import sharp from 'sharp';
import { ogPng } from '../../lib/og';
import { livePosts } from '../../lib/posts';
import { pillarLabel } from '../../lib/format';

/**
 * The same card as the PNG, re-encoded as JPEG.
 *
 * Instagram's Content Publishing API accepts JPEG only, so a PNG `image_url`
 * fails the container with no useful message. Nothing else should link here:
 * `og:image` stays on the PNG, which is smaller for this kind of artwork.
 */
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
  // Flattened onto white: JPEG has no alpha, and the card is drawn with one.
  const jpg = await sharp(png)
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: 88, progressive: true })
    .toBuffer();
  return new Response(new Uint8Array(jpg), {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
