// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

const SITE = 'https://a2zskillsewa.com';

export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    // The sitemap is a route of our own: see src/pages/sitemap-0.xml.ts.
    mdx(),
  ],
  image: { responsiveStyles: true },
  markdown: {
    shikiConfig: { theme: 'github-dark', wrap: false },
  },
  vite: { plugins: [tailwindcss()] },
});
