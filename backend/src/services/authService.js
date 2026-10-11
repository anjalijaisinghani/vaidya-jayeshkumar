import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const BCRYPT_ROUNDS = 12;
export const SESSION_HOURS = 8;
export const COOKIE_NAME = 'admin_token';

export const cookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: 'lax',
  path: '/',
};

// Compared against when the email is unknown, so response time
// does not reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', BCRYPT_ROUNDS);

export const hashPassword = (plain) => bcrypt.hash(plain, BCRYPT_ROUNDS);
export const verifyPassword = (plain, hash) => bcrypt.compare(plain, hash || DUMMY_HASH);

// A short fingerprint of the current password hash. It is stored inside the token,
// so changing the password makes every older token stop working.
export const passwordVersion = (hash) =>
  crypto.createHash('sha256').update(hash).digest('hex').slice(0, 16);

export function signAdminToken(adminId, passwordHash) {
  return jwt.sign(
    { sub: String(adminId), pwv: passwordVersion(passwordHash) },
    env.jwtSecret,
    { algorithm: 'HS256', expiresIn: `${SESSION_HOURS}h` }
  );
}

export function verifyAdminToken(token) {
  return jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
}