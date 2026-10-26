import { getCollection } from 'astro:content';
import { livePosts, postPath } from './posts';
import { absolute } from '../site';
import { latestDate } from './seo-dates';

/** Only canonical, indexable pages belong in the search-engine sitemap. */
export const sitemapEntries = async () => {
  const posts = (await livePosts()).filter(
    (post) => !post.data.noindex && !post.data.draft,
  );
  const [pillars, authors, pages] = await Promise.all([
    getCollection('pillars'),
    getCollection('authors'),
    getCollection('pages'),
  ]);
  const changed = (post: (typeof posts)[number]) =>
    latestDate([post.data.updatedAt, post.data.publishedAt]);
  const contentPages = pages.filter((page) => !page.data.noindex);
  const newest = latestDate([
    ...posts.map(changed),
    ...contentPages.map((page) => page.data.updatedAt),
  ]);
  return [
    { path: '/', lastmod: newest },
    { path: '/topics/', lastmod: latestDate(posts.map(changed)) },
    ...posts.map((post) => ({
      path: postPath(post),
      lastmod: changed(post),
      image: post.data.heroImage ? absolute(post.data.heroImage.src) : undefined,
    })),
    ...pillars.map((pillar) => ({
      path: `/topics/${pillar.id}/`,
      lastmod: latestDate(
        posts.filter((post) => post.data.pillar === pillar.id).map(changed),
      ),
    })),
    ...authors.map((author) => ({
      path: `/authors/${author.id}/`,
      lastmod: latestDate(
        posts.filter((post) => post.data.author.id === author.id).map(changed),
      ),
    })),
    ...contentPages.map((page) => ({ path: `/${page.id}/`, lastmod: page.data.updatedAt })),
  ];
};
