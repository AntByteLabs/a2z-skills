/**
 * Lists posts past their re-test date. Run weekly by .github/workflows/stale.yml,
 * which opens one issue per batch. With --json it prints machine-readable output
 * for the workflow; without it, a human-readable table.
 */
import { readPosts, toDate, isoDate, red, yellow, green, dim, bold } from './lib';

const RETEST_DAYS = 120;
const asJson = process.argv.includes('--json');

type Row = {
  slug: string;
  type: string;
  pillar: string;
  testedOn: string | null;
  retestBy: string | null;
  daysOverdue: number;
  versions: Record<string, string>;
};

const run = async () => {
  const posts = (await readPosts()).filter((p) => !p.frontmatter.draft);
  const now = Date.now();
  const rows: Row[] = [];

  for (const post of posts) {
    const f = post.frontmatter;
    const tested = toDate(f.testedOn?.date);
    const retest =
      toDate(f.retestBy) ??
      (tested ? new Date(tested.getTime() + RETEST_DAYS * 86_400_000) : undefined);
    if (!retest) continue;
    const daysOverdue = Math.floor((now - retest.getTime()) / 86_400_000);
    if (daysOverdue < 0) continue;
    rows.push({
      slug: post.slug,
      type: String(f.type ?? ''),
      pillar: String(f.pillar ?? ''),
      testedOn: tested ? isoDate(tested) : null,
      retestBy: isoDate(retest),
      daysOverdue,
      versions: f.testedOn?.versions ?? {},
    });
  }

  rows.sort((a, b) => b.daysOverdue - a.daysOverdue);

  if (asJson) {
    console.log(JSON.stringify(rows, null, 2));
    return;
  }

  if (!rows.length) {
    console.log(green(`\nNothing is overdue. ${posts.length} live post(s) checked.\n`));
    return;
  }

  console.log(bold(`\n${rows.length} post(s) due for re-testing\n`));
  for (const r of rows) {
    const age =
      r.daysOverdue > 60
        ? red(`${r.daysOverdue}d overdue`)
        : yellow(`${r.daysOverdue}d overdue`);
    console.log(`  ${bold(r.slug)}  ${age}`);
    console.log(
      dim(
        `    ${r.type} · ${r.pillar} · tested ${r.testedOn ?? 'never'} · due ${r.retestBy}` +
          (Object.keys(r.versions).length
            ? ` · ${Object.entries(r.versions)
                .map(([k, v]) => `${k} ${v}`)
                .join(', ')}`
            : ''),
      ),
    );
  }
  console.log('');
};

run().catch((error) => {
  console.error(red((error as Error).message));
  process.exit(1);
});
