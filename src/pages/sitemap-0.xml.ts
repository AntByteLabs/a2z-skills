import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { livePosts, postPath } from '../lib/posts';
import { site } from '../site';

type Entry = { path: string; lastmod?: Date; priority: number; changefreq: string };

/**
 * Written by hand rather than by the integration, because the integration
 * emits no lastmod and a freshness signal is the whole point on a site that
 * re-tests its guides.
 */
export const GET: APIRoute = async () => {
  const posts = await livePosts();
  const pillars = await getCollection('pillars');
  const authors = await getCollection('authors');
  const pages = (await getCollection('pages')).filter((p) => !p.data.noindex);

  const newest = posts[0]?.data.updatedAt ?? posts[0]?.data.publishedAt;

  const entries: Entry[] = [
    { path: '/', lastmod: newest, priority: 1.0, changefreq: 'daily' },
    { path: '/topics/', lastmod: newest, priority: 0.6, changefreq: 'weekly' },
    ...posts.map((post) => ({
      path: postPath(post),
      lastmod: post.data.updatedAt ?? post.data.publishedAt,
      priority: 0.9,
      changefreq: 'monthly',
    })),
    ...pillars.map((pillar) => ({
      path: `/topics/${pillar.id}/`,
      // A hub is as fresh as the newest post in it.
      lastmod: posts.find((p) => p.data.pillar === pillar.id)?.data.publishedAt,
      priority: 0.8,
      changefreq: 'weekly',
    })),
    ...authors.map((author) => ({
      path: `/authors/${author.id}/`,
      lastmod: posts.find((p) => p.data.author.id === author.id)?.data.publishedAt,
      priority: 0.5,
      changefreq: 'monthly',
    })),
    ...pages.map((page) => ({
      path: `/${page.id}/`,
      lastmod: page.data.updatedAt,
      priority: 0.4,
      changefreq: 'yearly',
    })),
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map((e) =>
      [
        '  <url>',
        `    <loc>${site.url}${e.path}</loc>`,
        e.lastmod ? `    <lastmod>${e.lastmod.toISOString().slice(0, 10)}</lastmod>` : '',
        `    <changefreq>${e.changefreq}</changefreq>`,
        `    <priority>${e.priority.toFixed(1)}</priority>`,
        '  </url>',
      ]
        .filter(Boolean)
        .join('\n'),
    ),
    '</urlset>',
  ].join('\n');

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
