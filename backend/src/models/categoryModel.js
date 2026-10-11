import { pool } from '../config/database.js';

export async function listWithPublishedCount() {
  const [rows] = await pool.query(
    `SELECT c.id, c.name, c.slug, c.description,
            COUNT(p.id) AS post_count
     FROM categories c
     LEFT JOIN posts p ON p.category_id = c.id AND p.status = 'PUBLISHED'
     GROUP BY c.id
     ORDER BY c.name`
  );
  return rows;
}