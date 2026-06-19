import { RateLimiterMemory } from 'rate-limiter-flexible';

// Note: rate-limiter-flexible in browser uses memory. For a real rate limit, it should be done backend-side.
// Since this is a React app, we simulate client-side throttling to prevent accidental spamming.
export const loginLimiter = new RateLimiterMemory({
  points: 5,        // 5 tentatives
  duration: 15 * 60 // par 15 minutes
});

export const apiLimiter = new RateLimiterMemory({
  points: 100,      // 100 requêtes
  duration: 60      // par minute
});

export async function protectedAction(limiter, key) {
  try {
    await limiter.consume(key);
    return true;
  } catch (err) {
    if (err.msBeforeNext) {
      throw new Error(`Trop de tentatives. Réessayez dans ${Math.ceil(err.msBeforeNext / 1000)}s`);
    }
    throw new Error('Trop de tentatives.');
  }
}
