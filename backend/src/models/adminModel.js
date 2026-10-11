import { pool } from '../config/database.js';

export async function findByEmail(email) {
  const [rows] = await pool.query(
    'SELECT id, name, email, password_hash FROM admins WHERE email = ? LIMIT 1',
    [email]
  );
  return rows[0] || null;
}

export async function findById(id) {
  const [rows] = await pool.query(
    'SELECT id, name, email FROM admins WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

export async function countAdmins() {
  const [rows] = await pool.query('SELECT COUNT(*) AS total FROM admins');
  return rows[0].total;
}

export async function createAdmin({ name, email, passwordHash }) {
  const [result] = await pool.query(
    'INSERT INTO admins (name, email, password_hash) VALUES (?, ?, ?)',
    [name, email, passwordHash]
  );
  return result.insertId;
}