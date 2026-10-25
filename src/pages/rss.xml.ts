import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { livePosts, postPath } from '../lib/posts';
import { site } from '../site';

export const GET: APIRoute = async (context) => {
  const posts = (await livePosts()).slice(0, 50);
  return rss({
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    site: context.site ?? site.url,
    trailingSlash: true,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishedAt,
      link: postPath(post),
      categories: [post.data.pillar, post.data.type],
      content: post.data.quickAnswer,
    })),
    customData: `<language>en-gb</language>`,
  });
};
