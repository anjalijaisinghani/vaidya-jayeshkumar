import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { parse } from '../utils/validate.js';
import { slugify } from '../utils/slugify.js';
import { idSchema } from '../validators/postSchemas.js';
import { createCategorySchema, updateCategorySchema } from '../validators/categorySchemas.js';
import * as categories from '../models/adminCategoryModel.js';

// The /treatments and /ayurvedic-points pages are built on these two categories.
const PROTECTED_SLUGS = ['ayurvedic-treatments', 'ayurvedic-points'];
const isProtected = (slug) => PROTECTED_SLUGS.includes(slug);

async function uniqueSlug(name) {
  const base = slugify(name) || 'category';
  let candidate = base;
  for (let n = 2; await categories.slugTaken(candidate); n += 1) {
    if (n > 500) throw new HttpError(409, 'Could not generate a unique slug');
    candidate = `${base}-${n}`;
  }
  return candidate;
}

function rethrowDuplicate(err) {
  if (err.code === 'ER_DUP_ENTRY') {
    const slugConflict = String(err.sqlMessage || '').includes('uq_categories_slug');
    throw new HttpError(
      409,
      slugConflict
        ? 'A category with this slug already exists'
        : 'A category with this name already exists'
    );
  }
  throw err;
}

const withFlag = (category) => ({ ...category, is_protected: isProtected(category.slug) });

export const listCategories = asyncHandler(async (req, res) => {
  const rows = await categories.listAll();
  res.json({ success: true, data: rows.map(withFlag) });
});

export const createCategory = asyncHandler(async (req, res) => {
  const data = parse(createCategorySchema, req.body);

  let slug = data.slug;
  if (slug) {
    if (await categories.slugTaken(slug)) {
      throw new HttpError(409, 'A category with this slug already exists');
    }
  } else {
    slug = await uniqueSlug(data.name);
  }

  let id;
  try {
    id = await categories.insert({
      name: data.name,
      slug,
      description: data.description ?? null,
    });
  } catch (err) {
    rethrowDuplicate(err);
  }

  res.status(201).json({ success: true, data: withFlag(await categories.findById(id)) });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const id = parse(idSchema, req.params.id);
  const existing = await categories.findById(id);
  if (!existing) throw new HttpError(404, 'Category not found');

  const data = parse(updateCategorySchema, req.body);
  try {
    await categories.update(id, data);
  } catch (err) {
    rethrowDuplicate(err);
  }

  res.json({ success: true, data: withFlag(await categories.findById(id)) });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const id = parse(idSchema, req.params.id);
  const existing = await categories.findById(id);
  if (!existing) throw new HttpError(404, 'Category not found');

  if (isProtected(existing.slug)) {
    throw new HttpError(
      409,
      'This category is used by a main page of the website and cannot be deleted. You can rename it instead.'
    );
  }

  const postCount = await categories.countPosts(id);
  if (postCount > 0) {
    throw new HttpError(
      409,
      `This category still has ${postCount} post(s). Move or delete them first.`
    );
  }

  try {
    await categories.remove(id);
  } catch (err) {
    // Backstop: the database foreign key also blocks deleting a category in use.
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      throw new HttpError(409, 'This category is still in use and cannot be deleted.');
    }
    throw err;
  }

  res.json({ success: true, data: { id, message: 'Category deleted' } });
});