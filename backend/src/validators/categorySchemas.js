import { z } from 'zod';

const slugField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1)
  .max(140)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug may contain only letters, numbers and single hyphens');

const descriptionField = z
  .string()
  .trim()
  .max(1000)
  .transform((value) => (value === '' ? null : value))
  .nullable();

export const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: slugField.optional(),
  description: descriptionField.optional(),
});

// strict(): sending a field that cannot be edited (such as slug) is an error, not ignored.
export const updateCategorySchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    description: descriptionField.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide a name or description to update',
  });