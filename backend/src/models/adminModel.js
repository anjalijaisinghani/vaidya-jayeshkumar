import { pool } from '../config/database.js';

export async function findByEmail(email) {
  const [rows] = await pool.query(
    'SELECT id, name, email, password_hash FROM admins WHERE email = ? LIMIT 1',
    [email]
  );
  return rows[0] || null;
}

// Includes password_hash for server-side checks. Never send this object to clients.
export async function findById(id) {
  const [rows] = await pool.query(
    'SELECT id, name, email, password_hash FROM admins WHERE id = ? LIMIT 1',
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

export async function updateAccount(id, { name, email }) {
  const fields = [];
  const params = [];
  if (name !== undefined) {
    fields.push('name = ?');
    params.push(name);
  }
  if (email !== undefined) {
    fields.push('email = ?');
    params.push(email);
  }
  if (fields.length === 0) return;
  params.push(id);
  await pool.query(`UPDATE admins SET ${fields.join(', ')} WHERE id = ?`, params);
}

export async function updatePasswordHash(id, passwordHash) {
  await pool.query('UPDATE admins SET password_hash = ? WHERE id = ?', [passwordHash, id]);
}