import { pool } from '../config/database.js';

const LIST_COLUMNS = `
  p.id, p.title, p.slug, p.excerpt, p.cover_image_url, p.is_featured,
  p.published_at, c.name AS category_name, c.slug AS category_slug`;

const FROM = 'FROM posts p JOIN categories c ON c.id = p.category_id';

// Escape LIKE wildcards so a search for "%" or "_" is treated as plain text.
function escapeLike(term) {
  return term.replace(/[\\%_]/g, '\\$&');
}

export async function listPublished({ page, limit, category, search }) {
  const where = ["p.status = 'PUBLISHED'"];
  const params = [];

  if (category) {
    where.push('c.slug = ?');
    params.push(category);
  }
  if (search) {
    where.push('(p.title LIKE ? OR p.excerpt LIKE ? OR p.content LIKE ?)');
    const like = `%${escapeLike(search)}%`;
    params.push(like, like, like);
  }

  const whereSql = `WHERE ${where.join(' AND ')}`;

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total ${FROM} ${whereSql}`,
    params
  );
  const total = countRows[0].total;

  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT ${LIST_COLUMNS} ${FROM} ${whereSql}
     ORDER BY p.published_at DESC, p.id DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { rows, total };
}

export async function listFeatured(limit) {
  const [rows] = await pool.query(
    `SELECT ${LIST_COLUMNS} ${FROM}
     WHERE p.status = 'PUBLISHED' AND p.is_featured = 1
     ORDER BY p.published_at DESC, p.id DESC
     LIMIT ?`,
    [limit]
  );
  return rows;
}

export async function findPublishedBySlug(slug) {
  const [rows] = await pool.query(
    `SELECT p.id, p.title, p.slug, p.excerpt, p.content, p.cover_image_url,
            p.is_featured, p.published_at, p.updated_at,
            c.name AS category_name, c.slug AS category_slug
     ${FROM}
     WHERE p.slug = ? AND p.status = 'PUBLISHED'
     LIMIT 1`,
    [slug]
  );
  return rows[0] || null;
}