// Emergency tool: sets a new password for the admin account.
// Run with:  npm run reset-admin-password
// It needs this computer's backend/.env, so only someone with server access can use it.
import { z } from 'zod';
import { pool } from '../src/config/database.js';
import { updatePasswordHash } from '../src/models/adminModel.js';
import { hashPassword } from '../src/services/authService.js';
import { askHidden } from './prompt.js';

const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .refine((value) => Buffer.byteLength(value) <= 72, 'Password is too long (72 bytes maximum)');

async function main() {
  const [admins] = await pool.query('SELECT id, name, email FROM admins ORDER BY id');

  if (admins.length === 0) {
    console.error('No admin account exists. Run: npm run create-admin');
    return;
  }
  if (admins.length > 1) {
    console.error('More than one admin account found. This tool supports a single admin only.');
    return;
  }

  const admin = admins[0];
  console.log(`Admin account found: ${admin.name} <${admin.email}>`);

  const password = await askHidden('New password (min 12 characters): ');
  const confirm = await askHidden('Confirm new password: ');

  if (password !== confirm) {
    console.error('Passwords did not match. Nothing was changed.');
    return;
  }

  const parsed = passwordSchema.safeParse(password);
  if (!parsed.success) {
    console.error(`Invalid password: ${parsed.error.issues[0].message}. Nothing was changed.`);
    return;
  }

  await updatePasswordHash(admin.id, await hashPassword(parsed.data));
  console.log('Password updated. All existing sessions are now signed out.');
}

main()
  .catch((err) => console.error('Failed:', err.code || err.message))
  .finally(() => pool.end());