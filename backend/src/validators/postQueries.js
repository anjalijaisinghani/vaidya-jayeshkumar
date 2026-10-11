import { z } from 'zod';
import { HttpError } from '../utils/httpError.js';

const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(9),
  category: z.string().trim().max(140).optional(),
  search: z.string().trim().max(100).optional(),
});

const featuredSchema = z.object({
  limit: z.coerce.number().int().min(1).max(12).default(3),
});

const slugSchema = z.string().trim().min(1).max(220);

function parse(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join('.') || 'value'}: ${issue.message}`)
      .join('; ');
    throw new HttpError(400, `Invalid request: ${message}`);
  }
  return result.data;
}

export const parseListQuery = (query) => parse(listSchema, query);
export const parseFeaturedQuery = (query) => parse(featuredSchema, query);
export const parseSlug = (slug) => parse(slugSchema, slug);