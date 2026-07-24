/**
 * apiKeyAuth.middleware.js
 * High-security API Key Authentication middleware.
 * Verifies SHA-256 key hash against database, validates status and expiration,
 * attaches scopes and application context, and logs usage metrics.
 */
const { ApiKeyManager } = require('../integrationPlatform');
const { apiKeyRepository, developerAppRepository } = require('../repositories');
const { sendError } = require('../utils/apiResponse');
const defaultPrisma = require('../utils/prismaClient');

function apiKeyAuthMiddleware({ optional = false } = {}) {
  return async (req, res, next) => {
    try {
      let rawKey = req.headers['x-api-key'];

      if (!rawKey && req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith('Bearer ')) {
          rawKey = authHeader.substring(7).trim();
        }
      }

      if (!rawKey) {
        if (optional) {
          req.apiKey = null;
          req.grantedScopes = [];
          return next();
        }
        return sendError(res, {
          statusCode: 401,
          errorCode: 'UNAUTHORIZED',
          message: 'API key is missing. Provide x-api-key header or Authorization: Bearer <key>.',
        });
      }

      // Hash raw key using SHA-256
      const keyHash = ApiKeyManager.hashKey(rawKey);

      // Find key record in DB
      const keyRecord = await apiKeyRepository.findByKeyHash(keyHash);

      if (!keyRecord) {
        return sendError(res, {
          statusCode: 401,
          errorCode: 'UNAUTHORIZED',
          message: 'Invalid API key provided.',
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

      // Load Developer App Context
      const devApp = await developerAppRepository.findById(keyRecord.developer_app_id);

      req.apiKey = keyRecord;
      req.developerApp = devApp;
      req.grantedScopes = keyRecord.scopes || [];
      req.msmeId = devApp ? devApp.msme_id : null;

      // Update last_used_at & log usage metrics asynchronously
      const startTime = req._startTime || Date.now();
      res.on('finish', async () => {
        try {
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
        } catch (usageErr) {
          // Non-blocking usage metric logging error
        }
      });

      next();
    } catch (err) {
      return sendError(res, {
        statusCode: 500,
        errorCode: 'AUTHENTICATION_ERROR',
        message: 'An error occurred during API key authentication.',
        details: err.message,
      });
    }
  };
}

module.exports = apiKeyAuthMiddleware;
