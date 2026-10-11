import rateLimit from 'express-rate-limit';

// Only failed attempts count; a successful login does not use up the allowance.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: { message: 'Too many failed login attempts. Try again in 15 minutes.' },
    });
  },
});