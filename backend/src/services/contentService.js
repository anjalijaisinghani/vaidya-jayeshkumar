import sanitizeHtml from 'sanitize-html';
import { isOwnImageUrl } from '../utils/imageUrl.js';

const postHtmlOptions = {
  allowedTags: [
    'h2', 'h3', 'h4', 'p', 'br', 'hr', 'ul', 'ol', 'li',
    'strong', 'b', 'em', 'i', 'u', 'blockquote', 'a', 'img',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height'],
  },
  allowedSchemes: ['https', 'http', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['https'] },
  allowProtocolRelative: false,
  transformTags: {
    a: (tagName, attribs) => {
      const out = { ...attribs, rel: 'noopener noreferrer' };
      if (/^https?:/i.test(attribs.href || '')) out.target = '_blank';
      else delete out.target;
      return { tagName, attribs: out };
    },
  },
  // Drop images with no src, or whose src is not from our own Cloudinary account.
  exclusiveFilter: (frame) =>
    frame.tag === 'img' && !(frame.attribs.src && isOwnImageUrl(frame.attribs.src)),
};

export const sanitizePostHtml = (html) => sanitizeHtml(html, postHtmlOptions);

export function htmlToText(html) {
  const spaced = html.replace(/<\/?(?:p|h[1-6]|ul|ol|li|blockquote|br|hr)\b[^>]*>/gi, ' ');
  return sanitizeHtml(spaced, { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

export function makeExcerpt(html, max = 200) {
  const text = htmlToText(html);
  return text.length > max ? `${text.slice(0, max - 3).trimEnd()}...` : text;
}

// True if the content has visible text or at least one image.
export const hasContent = (html) => htmlToText(html).length > 0 || /<img\s/i.test(html);