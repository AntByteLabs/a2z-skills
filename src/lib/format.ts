const dateFmt = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export const formatDate = (d: Date) => dateFmt.format(d);
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

/** Reading time at 230 wpm, rounded up, floor of 1 minute. */
export const readingMinutes = (body: string) =>
  Math.max(1, Math.ceil(body.trim().split(/\s+/).length / 230));

export const pillarLabel = (slug: string) =>
  slug
    .split('-')
    .map((w) => w[0]!.toUpperCase() + w.slice(1))
    .join(' ');

export const postTypeLabel = (type: string) =>
  ({
    'how-to': 'How-to guide',
    fix: 'Fix',
    explainer: 'Explainer',
    comparison: 'Comparison',
    review: 'Review',
    list: 'List',
    asset: 'Download',
  })[type] ?? type;
