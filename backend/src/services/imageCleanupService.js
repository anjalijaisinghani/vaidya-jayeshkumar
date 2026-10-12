import { publicIdFromUrl, imageUrlsInHtml } from '../utils/imageUrl.js';
import { isPublicIdReferenced } from '../models/imageUsageModel.js';
import { deleteImage, imageUploadsConfigured } from './imageService.js';

// Every image URL a post uses: its cover plus any images inside the content.
export function imagesOfPost(post) {
  return [post.cover_image_url, ...imageUrlsInHtml(post.content)].filter(Boolean);
}

// Call this AFTER the database change. Deletes each given image from Cloudinary
// only if nothing in the database still references it. Never throws: a Cloudinary
// problem must not break saving or deleting content.
export async function removeUnusedImages(urls) {
  if (!imageUploadsConfigured) return 0;

  const publicIds = [...new Set(urls.map(publicIdFromUrl).filter(Boolean))];
  let removed = 0;

  for (const publicId of publicIds) {
    try {
      if (await isPublicIdReferenced(publicId)) continue;
      if (await deleteImage(publicId)) removed += 1;
    } catch (err) {
      console.error('Image cleanup failed for one image:', err.message);
    }
  }
  return removed;
}