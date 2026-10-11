import rateLimit from 'express-rate-limit';

// Only failed attempts count; successful requests do not use up the allowance.
function failureLimiter(limit, message) {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    skipSuccessfulRequests: true,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({ success: false, error: { message } });
    },
  });
}

export const loginLimiter = failureLimiter(
  5,
  'Too many failed login attempts. Try again in 15 minutes.'
);

export const accountLimiter = failureLimiter(
  10,
  'Too many failed attempts. Try again in 15 minutes.'
);