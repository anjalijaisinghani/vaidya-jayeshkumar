import { z } from 'zod';

const slugField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1)
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug may contain only letters, numbers and single hyphens');

const imageUrl = z
  .string()
  .trim()
  .max(2048)
  .url()
  .refine((value) => value.startsWith('https://'), 'Image URL must start with https://');

const postFields = {
  title: z.string().trim().min(1).max(200),
  category_id: z.coerce.number().int().positive(),
  slug: slugField,
  excerpt: z.string().trim().max(500),
  content: z.string().max(500000),
  cover_image_url: imageUrl.nullable(),
  is_featured: z.boolean(),
};

export const createPostSchema = z.object({
  title: postFields.title,
  category_id: postFields.category_id,
  slug: postFields.slug.optional(),
  excerpt: postFields.excerpt.optional(),
  content: postFields.content.optional(),
  cover_image_url: postFields.cover_image_url.optional(),
  is_featured: postFields.is_featured.optional(),
  action: z.enum(['draft', 'publish']).default('draft'),
});

export const updatePostSchema = z
  .object({
    title: postFields.title.optional(),
    category_id: postFields.category_id.optional(),
    slug: postFields.slug.optional(),
    excerpt: postFields.excerpt.optional(),
    content: postFields.content.optional(),
    cover_image_url: postFields.cover_image_url.optional(),
    is_featured: postFields.is_featured.optional(),
    action: z.enum(['publish', 'unpublish']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update',
  });

export const adminListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  category: z.string().trim().max(140).optional(),
  search: z.string().trim().max(100).optional(),
});

export const idSchema = z.coerce.number().int().positive();