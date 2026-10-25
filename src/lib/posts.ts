import { getCollection, type CollectionEntry } from 'astro:content';
import { site } from '../site';

export type Post = CollectionEntry<'posts'>;

/**
 * Drafts never build in production; they stay visible in dev, and in a build
 * run with INCLUDE_DRAFTS=1 so the templates can be checked end to end.
 */
const showDrafts = !import.meta.env.PROD || import.meta.env.INCLUDE_DRAFTS === '1';

export const livePosts = async (): Promise<Post[]> => {
  const all = await getCollection('posts', ({ data }) => showDrafts || !data.draft);
  return all.sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
};

export const postsInPillar = async (pillar: string) =>
  (await livePosts()).filter((p) => p.data.pillar === pillar);

export const postsByAuthor = async (authorId: string) =>
  (await livePosts()).filter((p) => p.data.author.id === authorId);

/**
 * Related posts: same pillar first, then shared tags, never the post itself.
 */
export const relatedPosts = async (post: Post, limit = 4) => {
  const all = (await livePosts()).filter((p) => p.id !== post.id);
  const score = (p: Post) =>
    (p.data.pillar === post.data.pillar ? 10 : 0) +
    p.data.tags.filter((t) => post.data.tags.includes(t)).length;
  return all
    .map((p) => ({ p, s: score(p) }))
    .filter(({ s }) => s > 0)
    .sort(
      (a, b) =>
        b.s - a.s || b.p.data.publishedAt.getTime() - a.p.data.publishedAt.getTime(),
    )
    .slice(0, limit)
    .map(({ p }) => p);
};

/** The date a post should be re-tested: explicit, or RETEST_DAYS after testing. */
export const retestDate = (post: Post): Date | undefined => {
  if (post.data.retestBy) return post.data.retestBy;
  if (!post.data.testedOn) return undefined;
  const d = new Date(post.data.testedOn.date);
  d.setDate(d.getDate() + site.RETEST_DAYS);
  return d;
};

export const postPath = (post: Post) => `/${post.id}/`;
