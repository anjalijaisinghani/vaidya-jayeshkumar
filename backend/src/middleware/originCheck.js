import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

// Rejects state-changing requests that a browser sends from another website.
export function originCheck(req, res, next) {
  if (SAFE_METHODS.includes(req.method)) return next();
  const origin = req.get('Origin');
  if (origin && origin !== env.clientOrigin) {
    return next(new HttpError(403, 'Request origin not allowed'));
  }
  next();
}