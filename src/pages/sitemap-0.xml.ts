import type { APIRoute } from 'astro';
import { sitemapEntries } from '../lib/sitemap';
import { xmlEscape } from '../lib/seo-dates';
import { site } from '../site';

export const GET: APIRoute = async () => {
  const entries = await sitemapEntries();
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...entries.map((entry) =>
      [
        '  <url>',
        `    <loc>${xmlEscape(site.url + entry.path)}</loc>`,
        entry.lastmod
          ? `    <lastmod>${entry.lastmod.toISOString().slice(0, 10)}</lastmod>`
          : '',
        'image' in entry && entry.image
          ? `    <image:image><image:loc>${xmlEscape(entry.image)}</image:loc></image:image>`
          : '',
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
