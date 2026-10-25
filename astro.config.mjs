// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const SITE = 'https://a2zskillsewa.com';

export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    mdx(),
    sitemap({
      // Keep thin, private and redirect routes out of the index.
      filter: (page) => !/\/(search|thanks|go|og)\//.test(page) && !page.endsWith('.png'),
      serialize(item) {
        if (item.url === `${SITE}/`) item.priority = 1.0;
        else if (/\/topics\//.test(item.url)) item.priority = 0.8;
        return item;
      },
    }),
  ],
  image: { responsiveStyles: true },
  markdown: {
    shikiConfig: { theme: 'github-dark', wrap: false },
  },
  vite: { plugins: [tailwindcss()] },
});
