import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import {
  parseListQuery,
  parseFeaturedQuery,
  parseSlug,
} from '../validators/postQueries.js';
import { listPublished, listFeatured, findPublishedBySlug } from '../models/postModel.js';
import { listWithPublishedCount } from '../models/categoryModel.js';
import { getActiveProfile } from '../models/profileModel.js';

export const getProfile = asyncHandler(async (req, res) => {
  const profile = await getActiveProfile();
  if (!profile) throw new HttpError(404, 'Doctor profile not found');
  res.json({ success: true, data: profile });
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await listWithPublishedCount();
  res.json({ success: true, data: categories });
});

export const getPosts = asyncHandler(async (req, res) => {
  const query = parseListQuery(req.query);
  const { rows, total } = await listPublished(query);
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

export const getFeaturedPosts = asyncHandler(async (req, res) => {
  const { limit } = parseFeaturedQuery(req.query);
  const rows = await listFeatured(limit);
  res.json({ success: true, data: rows });
});

export const getPostBySlug = asyncHandler(async (req, res) => {
  const slug = parseSlug(req.params.slug);
  const post = await findPublishedBySlug(slug);
  if (!post) throw new HttpError(404, 'Post not found');
  res.json({ success: true, data: post });
});