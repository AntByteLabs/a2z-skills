import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { pillars, postTypes } from './site';

const posts = defineCollection({
  loader: glob({ pattern: '**/index.mdx', base: './src/content/posts' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().max(65),
        seoTitle: z.string().max(60).optional(),
        description: z.string().min(120).max(160),
        pillar: z.enum(pillars),
        type: z.enum(postTypes),
        tags: z.array(z.string()).max(6).default([]),
        author: reference('authors'),
        publishedAt: z.coerce.date(),
        updatedAt: z.coerce.date().optional(),
        testedOn: z
          .object({
            date: z.coerce.date(),
            // { "Windows 11": "25H2", "Excel": "2510" }
            versions: z.record(z.string(), z.string()),
            device: z.string().optional(),
            testedBy: z.string().optional(),
          })
          .optional(),
        retestBy: z.coerce.date().optional(),
        quickAnswer: z.string().max(300),
        faq: z
          .array(z.object({ q: z.string(), a: z.string() }))
          .max(8)
          .default([]),
        affiliates: z.array(z.string()).default([]),
        downloads: z.array(z.object({ label: z.string(), file: z.string() })).default([]),
        heroImage: image().optional(),
        heroAlt: z.string().optional(),
        draft: z.boolean().default(false),
        noindex: z.boolean().default(false),
      })
      .refine((p) => !['how-to', 'fix', 'review'].includes(p.type) || !!p.testedOn, {
        message: 'how-to, fix and review posts need testedOn',
        path: ['testedOn'],
      })
      .refine((p) => !p.heroImage || !!p.heroAlt, {
        message: 'heroImage needs heroAlt',
        path: ['heroAlt'],
      }),
});

const pillarsCollection = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/pillars' }),
  schema: z.object({
    name: z.string(),
    title: z.string().max(60),
    description: z.string().min(80).max(160),
    order: z.number().int(),
    accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    startHere: z.array(z.string()).max(3).default([]),
  }),
});

const authors = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/authors' }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    bio: z.string().min(60),
    avatar: z.string(),
    sameAs: z.array(z.url()).min(1),
    email: z.email().optional(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string().max(65),
    description: z.string().min(80).max(160),
    updatedAt: z.coerce.date(),
    order: z.number().int().default(99),
    noindex: z.boolean().default(false),
  }),
});

export const collections = { posts, pillars: pillarsCollection, authors, pages };
