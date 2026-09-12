import rateLimit from 'express-rate-limit';

// Standard rate limiter for API endpoints (300 requests per 15 min)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.', status: 429 },
});

// Stricter rate limiter for authentication routes (login / signup) to prevent brute force
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts, please try again later.', status: 429 },
});
