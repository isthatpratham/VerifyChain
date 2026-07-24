/**
 * apiRateLimiter.middleware.js
 * In-memory Token Bucket / Sliding Window Rate Limiting Middleware.
 * Enforces per-key or per-IP rate limits and attaches standard X-RateLimit-* headers.
 */
const { sendError } = require('../utils/apiResponse');

const rateLimitBuckets = new Map();
const WINDOW_MS = 60 * 1000; // 1 minute window
const DEFAULT_LIMIT_RPM = 120;

function apiRateLimiter({ defaultLimit = DEFAULT_LIMIT_RPM, windowMs = WINDOW_MS } = {}) {
  return (req, res, next) => {
    const identifier = req.apiKey ? `key_${req.apiKey.id}` : `ip_${req.ip || req.connection?.remoteAddress || 'unknown'}`;
    const now = Date.now();

    let bucket = rateLimitBuckets.get(identifier);

    if (!bucket || now > bucket.resetTime) {
      bucket = {
        count: 0,
        resetTime: now + windowMs,
        limit: req.apiKey?.rate_limit_rpm || defaultLimit,
      };
      rateLimitBuckets.set(identifier, bucket);
    }

    bucket.count++;
    const remaining = Math.max(0, bucket.limit - bucket.count);
    const resetSeconds = Math.ceil((bucket.resetTime - now) / 1000);

    res.setHeader('X-RateLimit-Limit', bucket.limit);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetSeconds);

    if (bucket.count > bucket.limit) {
      return sendError(res, {
        statusCode: 429,
        errorCode: 'TOO_MANY_REQUESTS',
        message: `Rate limit exceeded. Maximum ${bucket.limit} requests per minute allowed.`,
        details: {
          limit: bucket.limit,
          remaining: 0,
          retryAfterSeconds: resetSeconds,
        },
      });
    }

    next();
  };
}

module.exports = apiRateLimiter;
