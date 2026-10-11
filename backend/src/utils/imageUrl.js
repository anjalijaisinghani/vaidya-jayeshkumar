import { env } from '../config/env.js';

// Only images hosted in OUR Cloudinary account are accepted anywhere in the site.
export const imageUrlPrefix = env.cloudinary.cloudName
  ? `https://res.cloudinary.com/${env.cloudinary.cloudName}/`
  : null;

export function isOwnImageUrl(url) {
  return Boolean(imageUrlPrefix) && typeof url === 'string' && url.startsWith(imageUrlPrefix);
}