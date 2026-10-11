import { env } from '../config/env.js';

export function notFound(req, res) {
  res.status(404).json({
    success: false,
    error: { message: `Route not found: ${req.method} ${req.originalUrl}` },
  });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${status}: ${err.message}`);

  const message =
    status === 500 && env.nodeEnv === 'production' ? 'Internal server error' : err.message;

  res.status(status).json({ success: false, error: { message } });
}