/**
 * dualAuth.middleware.js
 * Dual Authentication Middleware — JWT (Frontend) + API Key (External Consumers).
 *
 * The Developer Platform routes must be accessible from:
 *   1. The authenticated frontend dashboard (sends JWT Bearer tokens)
 *   2. External API consumers (send API keys via x-api-key header)
 *
 * This middleware tries JWT authentication first. If the Authorization header
 * contains a valid JWT, it authenticates the user and grants all developer scopes.
 * If JWT auth fails or no JWT is present, it falls back to API key authentication.
 */
const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');
const { userRepository, msmeProfileRepository } = require('../repositories');
const { ApiKeyManager, SCOPES } = require('../integrationPlatform');
const { apiKeyRepository, developerAppRepository } = require('../repositories');
const { sendError } = require('../utils/apiResponse');

/**
 * All scopes granted to authenticated frontend users (JWT).
 * Dashboard users have full developer workspace access.
 */
const ALL_DEVELOPER_SCOPES = Object.values(SCOPES);

function dualAuthMiddleware() {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const apiKeyHeader = req.headers['x-api-key'];

    // ─── Path 1: JWT Authentication (Frontend) ────────────────────────────
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = extractTokenFromHeader(authHeader);

      if (token) {
        try {
          const decoded = verifyToken(token);

          if (decoded && decoded.id) {
            const user = await userRepository.findById(decoded.id, {
              select: { id: true, email: true, name: true, role: true, is_active: true },
            });

            if (user && user.is_active) {
              const msmeProfile = await msmeProfileRepository.findByUserId(user.id);

              req.user = {
                id: user.id,
                email: user.email,
                role: user.role,
                msmeId: msmeProfile ? msmeProfile.id : null,
              };
              req.msmeId = msmeProfile ? msmeProfile.id : null;
              req.grantedScopes = ALL_DEVELOPER_SCOPES;
              req.authMethod = 'JWT';

              return next();
            }
          }
        } catch (jwtErr) {
          // JWT validation failed — fall through to API key auth below.
          // This handles the case where the Bearer token is actually an API key.
        }
      }
    }

    // ─── Path 2: API Key Authentication (External Consumers) ──────────────
    let rawKey = apiKeyHeader;
    if (!rawKey && authHeader && authHeader.startsWith('Bearer ')) {
      rawKey = authHeader.substring(7).trim();
    }

    if (!rawKey) {
      // Pass unauthenticated request through — downstream requireScope will enforce 401 or allow public access
      req.user = null;
      req.apiKey = null;
      req.grantedScopes = [];
      req.authMethod = null;
      return next();
    }

    try {
      const keyHash = ApiKeyManager.hashKey(rawKey);
      const keyRecord = await apiKeyRepository.findByKeyHash(keyHash);

      if (!keyRecord) {
        return sendError(res, {
          statusCode: 401,
          errorCode: 'UNAUTHORIZED',
          message: 'Invalid API key or expired JWT token.',
        });
      }

      if (keyRecord.status !== 'ACTIVE') {
        return sendError(res, {
          statusCode: 401,
          errorCode: 'KEY_DISABLED',
          message: `API key is ${keyRecord.status.toLowerCase()}.`,
        });
      }

      if (ApiKeyManager.isKeyExpired(keyRecord.expires_at)) {
        return sendError(res, {
          statusCode: 401,
          errorCode: 'KEY_EXPIRED',
          message: 'API key has expired.',
        });
      }

      const devApp = await developerAppRepository.findById(keyRecord.developer_app_id);

      req.apiKey = keyRecord;
      req.developerApp = devApp;
      req.grantedScopes = keyRecord.scopes || [];
      req.msmeId = devApp ? devApp.msme_id : null;
      req.authMethod = 'API_KEY';

      // Async usage tracking
      const startTime = req._startTime || Date.now();
      res.on('finish', async () => {
        try {
          const defaultPrisma = require('../utils/prismaClient');
          await apiKeyRepository.update({ id: keyRecord.id }, { last_used_at: new Date() });
          await defaultPrisma.apiKeyUsage.create({
            data: {
              api_key_id: keyRecord.id,
              endpoint: req.originalUrl,
              http_method: req.method,
              status_code: res.statusCode,
              response_time_ms: Date.now() - startTime,
              request_ip: req.ip || req.connection?.remoteAddress,
              user_agent: req.headers['user-agent'] || null,
            },
          });
        } catch (_) { /* non-blocking */ }
      });

      return next();
    } catch (err) {
      return sendError(res, {
        statusCode: 500,
        errorCode: 'AUTHENTICATION_ERROR',
        message: 'An error occurred during authentication.',
        details: err.message,
      });
    }
  };
}

module.exports = dualAuthMiddleware;
