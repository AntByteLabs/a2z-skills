import type { APIRoute } from 'astro';
import { site } from '../site';

/**
 * A route rather than a static file, so the sitemap URL can never drift from
 * the one the site actually serves.
 *
 * Utility pages remain crawlable so their noindex rules can be read.
 * Googlebot controls Google Search; Google-Extended has a separate role.
 */
export const GET: APIRoute = () => {
  const aiCrawlers = [
    'GPTBot', // Model training; search uses OAI-SearchBot below.
    'OAI-SearchBot', // ChatGPT search
    'ChatGPT-User', // a person asking ChatGPT to open a page
    'ClaudeBot',
    'Claude-Web',
    'anthropic-ai',
    'PerplexityBot',
    'Perplexity-User',
    'Google-Extended', // Does not control Google Search inclusion.
    'Applebot-Extended', // Apple Intelligence
    'CCBot', // Common Crawl, which many models are trained from
    'Bytespider',
    'Amazonbot',
    'cohere-ai',
    'Meta-ExternalAgent',
    'DuckAssistBot',
    'YouBot',
  ];

  const lines = [
    `# ${site.name} — ${site.url}`,
    '# Tested guides. Quote them, cite them, link them.',
    '',
    'User-agent: *',
    'Allow: /',
    '',
    '# Nothing worth indexing, and /go/ is affiliate redirects.',
    'Disallow: /go/',
    'Disallow: /api/',
    '',
    '# Answer engines are welcome here, explicitly.',
    ...aiCrawlers.flatMap((bot) => [
      `User-agent: ${bot}`,
      'Allow: /',
      'Disallow: /go/',
      'Disallow: /api/',
      '',
    ]),
    `Sitemap: ${site.url}/sitemap-index.xml`,
    '',
    `# A plain-text map of the site for language models: ${site.url}/llms.txt`,
    `# Every guide in full, one file: ${site.url}/llms-full.txt`,
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
