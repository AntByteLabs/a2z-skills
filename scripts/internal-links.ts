/**
 * npm run suggest-links -- <slug>
 *
 * Finds older posts that already mention the new post's keywords and prints the
 * sentence to link from. Links are added by hand: the script never edits a post.
 */
import { readPosts, red, green, dim, bold, yellow } from './lib';

const target = process.argv[2];

const run = async () => {
  const posts = await readPosts();
  if (!target) {
    console.error(red('Usage: npm run suggest-links -- <slug>'));
    console.error(dim(`Slugs: ${posts.map((p) => p.slug).join(', ')}`));
    process.exit(1);
  }
  const post = posts.find((p) => p.slug === target);
  if (!post) {
    console.error(red(`No post at src/content/posts/${target}/`));
    process.exit(1);
  }

  // Keywords: the slug's words, the title's words and the tags.
  const stop = new Set(['with', 'from', 'that', 'this', 'your', 'what', 'when', 'does']);
  const terms = new Set(
    [
      ...target.split('-'),
      ...String(post.frontmatter.title ?? '')
        .toLowerCase()
        .split(/\W+/),
      ...(post.frontmatter.tags ?? []).map((t) => t.toLowerCase()),
    ].filter((t) => t.length > 3 && !stop.has(t)),
  );

  const linkPath = `/${target}/`;
  const others = posts.filter((p) => p.slug !== target);
  let suggestions = 0;

  console.log(bold(`\nPlaces to link ${linkPath} from\n`));

  for (const other of others) {
    if (other.body.includes(linkPath)) {
      console.log(dim(`  ${other.slug} — already links here`));
      continue;
    }
    const sentences = other.body
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .split(/(?<=[.!?])\s+/);

    const hits = sentences
      .map((s) => ({
        s: s.trim(),
        score: [...terms].filter((t) => s.toLowerCase().includes(t)).length,
      }))
      .filter((h) => h.score > 0 && h.s.length > 40)
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);

    if (!hits.length) continue;
    suggestions += hits.length;
    const samePillar = other.frontmatter.pillar === post.frontmatter.pillar;
    console.log(`  ${bold(other.slug)}${samePillar ? green(' (same pillar)') : ''}`);
    console.log(dim(`    src/content/posts/${other.slug}/index.mdx`));
    for (const h of hits) {
      console.log(`    ${yellow('·')} ${h.s.slice(0, 160).replace(/\s+/g, ' ')}`);
    }
    console.log('');
  }

  if (!suggestions) {
    console.log(
      dim('  Nothing mentions this topic yet. Add the links when the next post lands.\n'),
    );
  } else {
    console.log(
      dim(`  Add 2 to 3 of these as links to ${linkPath}, in the same pull request.\n`),
    );
  }
};

run().catch((error) => {
  console.error(red((error as Error).message));
  process.exit(1);
});
