// Turns a title into a URL-safe slug: "Tea & Herbs: 10 Tips!" -> "tea-and-herbs-10-tips"
// Non-English characters are dropped; callers fall back to a default if nothing is left.
export function slugify(text) {
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+/, '')
    .slice(0, 180)
    .replace(/-+$/, '');
}