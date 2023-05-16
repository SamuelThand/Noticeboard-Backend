import { rateLimit } from 'express-rate-limit';

/**
 * Limits the amount of unsuccessful attempts for 15 minutes.
 */
export const loginLimiter15m = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many login attempts in a short time.',
  skipSuccessfulRequests: true
});

/**
 * Limits the amount of unsuccessful logins for 24 hours.
 */
export const loginLimiter24h = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 20,
  message: 'Too many login attempts in 24 hours.',
  skipSuccessfulRequests: true
});

/**
 * Limits the total amount of requests sent in a 10 minute time-frame.
 */
export const requestSpamLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 200,
  message:
    'Too many requests in a short timeframe from this IP. Please try again later.'
});
