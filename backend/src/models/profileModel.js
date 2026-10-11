import { pool } from '../config/database.js';

export async function getActiveProfile() {
  const [rows] = await pool.query(
    'SELECT * FROM doctor_profile ORDER BY id LIMIT 1'
  );
  return rows[0] || null;
}