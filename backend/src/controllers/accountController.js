import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { parse } from '../utils/validate.js';
import { updateAccountSchema, changePasswordSchema } from '../validators/authSchemas.js';
import { findById, updateAccount, updatePasswordHash } from '../models/adminModel.js';
import {
  COOKIE_NAME,
  SESSION_HOURS,
  cookieOptions,
  hashPassword,
  verifyPassword,
  signAdminToken,
} from '../services/authService.js';

export const updateAccountDetails = asyncHandler(async (req, res) => {
  const data = parse(updateAccountSchema, req.body);
  const emailChanging = data.email !== undefined && data.email !== req.admin.email;

  if (emailChanging) {
    if (!data.currentPassword) {
      throw new HttpError(400, 'Current password is required to change the email');
    }
    const ok = await verifyPassword(data.currentPassword, req.adminPasswordHash);
    // 403, not 401: the session is fine, only the confirmation was wrong.
    if (!ok) throw new HttpError(403, 'Current password is incorrect');
  }

  try {
    await updateAccount(req.admin.id, {
      name: data.name,
      email: emailChanging ? data.email : undefined,
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') throw new HttpError(409, 'That email is already in use');
    throw err;
  }

  const updated = await findById(req.admin.id);
  res.json({
    success: true,
    data: { id: updated.id, name: updated.name, email: updated.email },
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = parse(changePasswordSchema, req.body);

  const ok = await verifyPassword(currentPassword, req.adminPasswordHash);
  if (!ok) throw new HttpError(403, 'Current password is incorrect');

  const newHash = await hashPassword(newPassword);
  await updatePasswordHash(req.admin.id, newHash);

  // Keep this session signed in with a fresh token; all older tokens are now invalid.
  res.cookie(COOKIE_NAME, signAdminToken(req.admin.id, newHash), {
    ...cookieOptions,
    maxAge: SESSION_HOURS * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    data: { message: 'Password updated. All other sessions have been signed out.' },
  });
});