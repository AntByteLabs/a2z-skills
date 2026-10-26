import type { APIRoute } from 'astro';
import { sitemapEntries } from '../lib/sitemap';
import { latestDate, xmlEscape } from '../lib/seo-dates';
import { site } from '../site';

/** Keep the endpoint already submitted to Search Console. */
export const GET: APIRoute = async () => {
  const newest = latestDate((await sitemapEntries()).map((entry) => entry.lastmod));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${xmlEscape(site.url)}/sitemap-0.xml</loc>
    ${newest ? `<lastmod>${newest.toISOString().slice(0, 10)}</lastmod>` : ''}
  </sitemap>
</sitemapindex>
`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
