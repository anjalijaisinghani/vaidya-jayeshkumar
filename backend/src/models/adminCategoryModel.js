import { pool } from '../config/database.js';

// Counts include drafts, unlike the public category list.
export async function listAll() {
  const [rows] = await pool.query(
    `SELECT c.id, c.name, c.slug, c.description,
            COUNT(p.id) AS post_count,
            COALESCE(SUM(p.status = 'PUBLISHED'), 0) AS published_count
     FROM categories c
     LEFT JOIN posts p ON p.category_id = c.id
     GROUP BY c.id
     ORDER BY c.name`
  );
  return rows.map((row) => ({
    ...row,
    post_count: Number(row.post_count),
    published_count: Number(row.published_count),
  }));
}

export async function findById(id) {
  const [rows] = await pool.query(
    'SELECT id, name, slug, description FROM categories WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

export async function slugTaken(slug) {
  const [rows] = await pool.query('SELECT 1 FROM categories WHERE slug = ? LIMIT 1', [slug]);
  return rows.length > 0;
}

export async function insert({ name, slug, description }) {
  const [result] = await pool.query(
    'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)',
    [name, slug, description]
  );
  return result.insertId;
}

export async function update(id, fields) {
  const sets = [];
  const params = [];
  if (fields.name !== undefined) {
    sets.push('name = ?');
    params.push(fields.name);
  }
  if (fields.description !== undefined) {
    sets.push('description = ?');
    params.push(fields.description);
  }
  if (sets.length === 0) return;
  params.push(id);
  await pool.query(`UPDATE categories SET ${sets.join(', ')} WHERE id = ?`, params);
}

export async function countPosts(id) {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS total FROM posts WHERE category_id = ?',
    [id]
  );
  return Number(rows[0].total);
}

export async function remove(id) {
  const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [id]);
  return result.affectedRows > 0;
}