import { pool } from '../config/database.js';

// Only these columns can ever be written by updateProfile().
const UPDATABLE = [
  'doctor_name', 'qualifications', 'specialization', 'experience', 'about',
  'phone', 'whatsapp', 'email', 'address', 'timings', 'map_url', 'profile_image_url',
];

export async function getActiveProfile() {
  const [rows] = await pool.query(
    'SELECT * FROM doctor_profile ORDER BY id LIMIT 1'
  );
  return rows[0] || null;
}

export async function updateProfile(id, fields) {
  const sets = [];
  const params = [];
  for (const column of UPDATABLE) {
    if (fields[column] !== undefined) {
      sets.push(`${column} = ?`);
      params.push(fields[column]);
    }
  }
  if (sets.length === 0) return;
  params.push(id);
  await pool.query(`UPDATE doctor_profile SET ${sets.join(', ')} WHERE id = ?`, params);
}