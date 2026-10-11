import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { parse } from '../utils/validate.js';
import { loginSchema } from '../validators/authSchemas.js';
import { findByEmail } from '../models/adminModel.js';
import {
  COOKIE_NAME,
  SESSION_HOURS,
  cookieOptions,
  signAdminToken,
  verifyPassword,
} from '../services/authService.js';

export const login = asyncHandler(async (req, res) => {
  const { email, password } = parse(loginSchema, req.body);

  const admin = await findByEmail(email);
  const passwordOk = await verifyPassword(password, admin?.password_hash);

  if (!admin || !passwordOk) {
    // Same message for unknown email and wrong password.
    throw new HttpError(401, 'Invalid email or password');
  }

  res.cookie(COOKIE_NAME, signAdminToken(admin.id, admin.password_hash), {
    ...cookieOptions,
    maxAge: SESSION_HOURS * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    data: { id: admin.id, name: admin.name, email: admin.email },
  });
});

export const logout = (req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions);
  res.json({ success: true, data: { message: 'Logged out' } });
};

export const me = (req, res) => {
  res.json({ success: true, data: req.admin });
};