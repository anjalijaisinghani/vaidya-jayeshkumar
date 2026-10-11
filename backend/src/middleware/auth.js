import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { COOKIE_NAME, verifyAdminToken } from '../services/authService.js';
import { findById } from '../models/adminModel.js';

export const requireAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) throw new HttpError(401, 'Authentication required');

  let payload;
  try {
    payload = verifyAdminToken(token);
  } catch {
    throw new HttpError(401, 'Session expired or invalid');
  }

  const admin = await findById(Number(payload.sub));
  if (!admin) throw new HttpError(401, 'Authentication required');

  req.admin = admin;
  next();
});