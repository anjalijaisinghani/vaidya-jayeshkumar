import { pool } from '../config/database.js';
import { escapeLike } from '../utils/sql.js';

const FROM = 'FROM posts p JOIN categories c ON c.id = p.category_id';

const LIST_COLUMNS = `
  p.id, p.title, p.slug, p.excerpt, p.cover_image_url, p.status, p.is_featured,
  p.published_at, p.created_at, p.updated_at,
  c.id AS category_id, c.name AS category_name, c.slug AS category_slug`;

// Only these columns can ever be written by updatePost().
const UPDATABLE = [
  'category_id', 'title', 'slug', 'excerpt', 'content',
  'cover_image_url', 'status', 'is_featured',
];

export async function listAll({ page, limit, status, category, search }) {
  const where = [];
  const params = [];

  if (status) {
    where.push('p.status = ?');
    params.push(status);
  }
  if (category) {
    where.push('c.slug = ?');
    params.push(category);
  }
  if (search) {
    where.push('(p.title LIKE ? OR p.excerpt LIKE ?)');
    const like = `%${escapeLike(search)}%`;
    params.push(like, like);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const [countRows] = await pool.query(`SELECT COUNT(*) AS total ${FROM} ${whereSql}`, params);
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT ${LIST_COLUMNS} ${FROM} ${whereSql}
     ORDER BY p.updated_at DESC, p.id DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { rows, total: countRows[0].total };
}

export async function findById(id) {
  const [rows] = await pool.query(
    `SELECT p.*, c.name AS category_name, c.slug AS category_slug
     ${FROM}
     WHERE p.id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

// excludeId lets a post keep its own slug when it is edited.
export async function slugTaken(slug, excludeId = 0) {
  const [rows] = await pool.query(
    'SELECT 1 FROM posts WHERE slug = ? AND id <> ? LIMIT 1',
    [slug, excludeId]
  );
  return rows.length > 0;
}

export async function insertPost(post) {
  const [result] = await pool.query(
    `INSERT INTO posts
       (category_id, title, slug, excerpt, content, cover_image_url, status, is_featured, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, IF(? = 'PUBLISHED', NOW(), NULL))`,
    [
      post.category_id,
      post.title,
      post.slug,
      post.excerpt,
      post.content,
      post.cover_image_url,
      post.status,
      post.is_featured ? 1 : 0,
      post.status,
    ]
  );
  return result.insertId;
}

// publishedAt: 'now' sets the publish time, 'clear' removes it, undefined leaves it alone.
export async function updatePost(id, fields, publishedAt) {
  const sets = [];
  const params = [];

  for (const column of UPDATABLE) {
    if (fields[column] !== undefined) {
      sets.push(`${column} = ?`);
      params.push(column === 'is_featured' ? (fields[column] ? 1 : 0) : fields[column]);
    }
  }
  if (publishedAt === 'now') sets.push('published_at = NOW()');
  if (publishedAt === 'clear') sets.push('published_at = NULL');

  if (sets.length === 0) return;
  params.push(id);
  await pool.query(`UPDATE posts SET ${sets.join(', ')} WHERE id = ?`, params);
}

export async function deletePost(id) {
  const [result] = await pool.query('DELETE FROM posts WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function dashboardCounts() {
  const [postRows] = await pool.query(
    `SELECT COUNT(*) AS total_posts,
            COALESCE(SUM(status = 'PUBLISHED'), 0) AS published_posts,
            COALESCE(SUM(status = 'DRAFT'), 0) AS draft_posts
     FROM posts`
  );
  const [catRows] = await pool.query('SELECT COUNT(*) AS total_categories FROM categories');
  return {
    total_posts: Number(postRows[0].total_posts),
    published_posts: Number(postRows[0].published_posts),
    draft_posts: Number(postRows[0].draft_posts),
    total_categories: Number(catRows[0].total_categories),
  };
}