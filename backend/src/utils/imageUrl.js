import { env } from '../config/env.js';

// Only images hosted in OUR Cloudinary account are accepted anywhere in the site.
export const imageUrlPrefix = env.cloudinary.cloudName
  ? `https://res.cloudinary.com/${env.cloudinary.cloudName}/`
  : null;

export function isOwnImageUrl(url) {
  return Boolean(imageUrlPrefix) && typeof url === 'string' && url.startsWith(imageUrlPrefix);
}

// Our uploads look like: <prefix>image/upload/v1234567890/<random_id>.<ext>
// Anything else (folders, transformations, other asset types) returns null,
// which means "never delete this automatically".
export function publicIdFromUrl(url) {
  if (!isOwnImageUrl(url)) return null;
  const rest = url.slice(imageUrlPrefix.length);
  const match = /^image\/upload\/(?:v\d+\/)?([A-Za-z0-9_-]+)\.(?:jpe?g|png|webp)$/i.exec(rest);
  return match ? match[1] : null;
}

// Finds the src of every <img> in already-sanitized post HTML.
export function imageUrlsInHtml(html) {
  const urls = new Set();
  const pattern = /<img\b[^>]*?\ssrc="([^"]+)"/gi;
  let match;
  while ((match = pattern.exec(html || '')) !== null) urls.add(match[1]);
  return [...urls];
}