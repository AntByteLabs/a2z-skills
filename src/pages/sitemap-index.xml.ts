import type { APIRoute } from 'astro';
import { livePosts } from '../lib/posts';
import { site } from '../site';

/** The URL already submitted to Search Console, so the name is fixed. */
export const GET: APIRoute = async () => {
  const posts = await livePosts();
  const newest = posts[0]?.data.updatedAt ?? posts[0]?.data.publishedAt ?? new Date();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${site.url}/sitemap-0.xml</loc>
    <lastmod>${newest.toISOString().slice(0, 10)}</lastmod>
  </sitemap>
</sitemapindex>
`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
