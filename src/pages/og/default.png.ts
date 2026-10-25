import type { APIRoute } from 'astro';
import { ogPng } from '../../lib/og';
import { site } from '../../site';

export const GET: APIRoute = async () => {
  const png = await ogPng({
    title: 'Tech fixes that were actually tried before they were published.',
    kicker: site.name,
  });
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400' },
  });
};
