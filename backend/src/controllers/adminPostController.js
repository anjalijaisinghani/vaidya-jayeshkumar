import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { parse } from '../utils/validate.js';
import { slugify } from '../utils/slugify.js';
import {
  createPostSchema,
  updatePostSchema,
  adminListQuerySchema,
  idSchema,
} from '../validators/postSchemas.js';
import { sanitizePostHtml, makeExcerpt, hasContent } from '../services/contentService.js';
import { findById as findCategoryById } from '../models/categoryModel.js';
import * as posts from '../models/adminPostModel.js';

async function assertCategoryExists(categoryId) {
  if (!(await findCategoryById(categoryId))) {
    throw new HttpError(400, 'Category does not exist');
  }
}

async function uniqueSlug(title) {
  const base = slugify(title) || 'post';
  let candidate = base;
  for (let n = 2; await posts.slugTaken(candidate); n += 1) {
    if (n > 500) throw new HttpError(409, 'Could not generate a unique slug');
    candidate = `${base}-${n}`;
  }
  return candidate;
}

function rethrowDuplicate(err) {
  if (err.code === 'ER_DUP_ENTRY') {
    throw new HttpError(409, 'A post with this slug already exists');
  }
  throw err;
}

export const getDashboard = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await posts.dashboardCounts() });
});

export const listPosts = asyncHandler(async (req, res) => {
  const query = parse(adminListQuerySchema, req.query);
  const { rows, total } = await posts.listAll(query);
  res.json({
    success: true,
    data: rows,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  });
});

export const getPost = asyncHandler(async (req, res) => {
  const id = parse(idSchema, req.params.id);
  const post = await posts.findById(id);
  if (!post) throw new HttpError(404, 'Post not found');
  res.json({ success: true, data: post });
});

export const createPost = asyncHandler(async (req, res) => {
  const data = parse(createPostSchema, req.body);
  await assertCategoryExists(data.category_id);

  const content = sanitizePostHtml(data.content ?? '');
  const publishing = data.action === 'publish';
  if (publishing && !hasContent(content)) {
    throw new HttpError(400, 'Content is required to publish a post');
  }

  let slug = data.slug;
  if (slug) {
    if (await posts.slugTaken(slug)) throw new HttpError(409, 'A post with this slug already exists');
  } else {
    slug = await uniqueSlug(data.title);
  }

  let id;
  try {
    id = await posts.insertPost({
      category_id: data.category_id,
      title: data.title,
      slug,
      excerpt: data.excerpt || makeExcerpt(content) || null,
      content,
      cover_image_url: data.cover_image_url ?? null,
      status: publishing ? 'PUBLISHED' : 'DRAFT',
      is_featured: data.is_featured ?? false,
    });
  } catch (err) {
    rethrowDuplicate(err);
  }

  res.status(201).json({ success: true, data: await posts.findById(id) });
});

export const updatePost = asyncHandler(async (req, res) => {
  const id = parse(idSchema, req.params.id);
  const existing = await posts.findById(id);
  if (!existing) throw new HttpError(404, 'Post not found');

  const data = parse(updatePostSchema, req.body);
  if (data.category_id !== undefined) await assertCategoryExists(data.category_id);

  const content = data.content !== undefined ? sanitizePostHtml(data.content) : existing.content;

  // Work out the resulting status and what to do with the publish time.
  let status = existing.status;
  let publishedAt;
  if (data.action === 'publish') {
    status = 'PUBLISHED';
    if (existing.status !== 'PUBLISHED') publishedAt = 'now';
  } else if (data.action === 'unpublish') {
    status = 'DRAFT';
    publishedAt = 'clear';
  }

  if (status === 'PUBLISHED' && !hasContent(content)) {
    throw new HttpError(400, 'Content is required for a published post');
  }

  if (data.slug !== undefined && data.slug !== existing.slug) {
    if (await posts.slugTaken(data.slug, id)) {
      throw new HttpError(409, 'A post with this slug already exists');
    }
  }

  const fields = { status };
  if (data.title !== undefined) fields.title = data.title;
  if (data.category_id !== undefined) fields.category_id = data.category_id;
  if (data.slug !== undefined) fields.slug = data.slug;
  if (data.content !== undefined) fields.content = content;
  if (data.cover_image_url !== undefined) fields.cover_image_url = data.cover_image_url;
  if (data.is_featured !== undefined) fields.is_featured = data.is_featured;
  if (data.excerpt !== undefined) fields.excerpt = data.excerpt || makeExcerpt(content) || null;

  try {
    await posts.updatePost(id, fields, publishedAt);
  } catch (err) {
    rethrowDuplicate(err);
  }

  res.json({ success: true, data: await posts.findById(id) });
});

export const deletePost = asyncHandler(async (req, res) => {
  const id = parse(idSchema, req.params.id);
  const removed = await posts.deletePost(id);
  if (!removed) throw new HttpError(404, 'Post not found');
  res.json({ success: true, data: { id, message: 'Post deleted' } });
});