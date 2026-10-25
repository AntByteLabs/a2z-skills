/**
 * Typed JSON-LD builders. Every page's structured data comes from here,
 * so the shape cannot drift between templates.
 */
import type {
  BlogPosting,
  BreadcrumbList,
  CollectionPage,
  Organization,
  Person,
  ProfilePage,
  SoftwareApplication,
  WebSite,
  WithContext,
} from 'schema-dts';
import { site, absolute } from '../site';

const ORG_ID = `${site.url}/#organization`;
const SITE_ID = `${site.url}/#website`;

export const organization = (): Organization => ({
  '@type': 'Organization',
  '@id': ORG_ID,
  name: site.publisher.name,
  url: site.publisher.url,
  logo: absolute('/logo.png'),
  sameAs: Object.values(site.social).filter(Boolean) as string[],
});

export const website = (): WithContext<WebSite> => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': SITE_ID,
  // Google reads `name` for the site name in search results.
  name: site.name,
  alternateName: site.alternateName,
  url: `${site.url}/`,
  inLanguage: site.locale,
  description: site.description,
  publisher: { '@id': ORG_ID },
});

export type Crumb = { name: string; path: string };

export const breadcrumbs = (crumbs: Crumb[]): WithContext<BreadcrumbList> => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.name,
    item: absolute(c.path),
  })),
});

export type PostSchemaInput = {
  title: string;
  description: string;
  path: string;
  image: string;
  publishedAt: Date;
  updatedAt?: Date;
  author: { name: string; path: string; sameAs: string[] };
  /** Set on review posts so the review subject is explicit. */
  subject?: { name: string; category?: string };
};

export const blogPosting = (p: PostSchemaInput): WithContext<BlogPosting> => {
  // Built as a plain record: intersecting schema-dts types blows up the compiler.
  const node: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${absolute(p.path)}#article`,
    headline: p.title,
    description: p.description,
    image: p.image,
    inLanguage: site.locale,
    mainEntityOfPage: { '@type': 'WebPage', '@id': absolute(p.path) },
    datePublished: p.publishedAt.toISOString(),
    dateModified: (p.updatedAt ?? p.publishedAt).toISOString(),
    author: {
      '@type': 'Person',
      name: p.author.name,
      url: absolute(p.author.path),
      sameAs: p.author.sameAs,
    },
    publisher: { '@id': ORG_ID },
    isPartOf: { '@id': SITE_ID },
  };
  if (p.subject) {
    // Review subject only. No aggregateRating: we do not invent scores.
    const app: SoftwareApplication = {
      '@type': 'SoftwareApplication',
      name: p.subject.name,
      applicationCategory: p.subject.category ?? 'UtilitiesApplication',
    };
    node.about = app;
  }
  return node as unknown as WithContext<BlogPosting>;
};

export const profilePage = (a: {
  name: string;
  role: string;
  bio: string;
  path: string;
  avatar: string;
  sameAs: string[];
}): WithContext<ProfilePage> => {
  const person: Person = {
    '@type': 'Person',
    name: a.name,
    jobTitle: a.role,
    description: a.bio,
    image: a.avatar,
    url: absolute(a.path),
    sameAs: a.sameAs,
    worksFor: { '@id': ORG_ID },
  };
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${absolute(a.path)}#profile`,
    mainEntity: person,
    isPartOf: { '@id': SITE_ID },
  };
};

export const collectionPage = (c: {
  name: string;
  description: string;
  path: string;
}): WithContext<CollectionPage> => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': `${absolute(c.path)}#collection`,
  name: c.name,
  description: c.description,
  url: absolute(c.path),
  isPartOf: { '@id': SITE_ID },
  publisher: { '@id': ORG_ID },
});
