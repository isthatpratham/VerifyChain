/**
 * scopeAuth.middleware.js
 * Scope-Based Authorization Middleware.
 * Enforces least privilege per REST endpoint, verifying req.grantedScopes.
 */
const { hasScope, hasAllScopes } = require('../integrationPlatform');
const { sendError } = require('../utils/apiResponse');
const AuditPublisher = require('../audit/AuditPublisher');

/**
 * Require a single permission scope
 */
function requireScope(requiredScope) {
  return (req, res, next) => {
    // Skip scope enforcement if route allows unauthenticated/public access and no API key was supplied
    if (!req.apiKey && requiredScope === 'public.verify') {
      return next();
    }

    if (!req.grantedScopes || !hasScope(req.grantedScopes, requiredScope)) {
      AuditPublisher.publishSecurity({
        actorId: req.user?.id ? `USER_${req.user.id}` : req.apiKey?.keyPrefix ? `KEY_${req.apiKey.keyPrefix}` : 'ANONYMOUS',
        msmeId: req.msmeId || req.user?.msmeId || 1,
        action: 'PERMISSION_DENIED',
        severity: 'WARNING',
        status: 'FAILURE',
        ipAddress: req.ip || req.headers['x-forwarded-for'],
        userAgent: req.headers['user-agent'],
        details: { requiredScope, grantedScopes: req.grantedScopes || [], endpoint: req.originalUrl },
      }).catch(() => {});

      return sendError(res, {
        statusCode: 403,
        errorCode: 'INSUFFICIENT_SCOPE',
        message: `Insufficient permissions. Required scope: '${requiredScope}'.`,
        details: {
          requiredScope,
          grantedScopes: req.grantedScopes || [],
        },
      });
    }

    next();
  };
}

/**
 * Require all specified permission scopes
 */
function requireAllScopes(requiredScopes = []) {
  return (req, res, next) => {
    if (!req.grantedScopes || !hasAllScopes(req.grantedScopes, requiredScopes)) {
      AuditPublisher.publishSecurity({
        actorId: req.user?.id ? `USER_${req.user.id}` : req.apiKey?.keyPrefix ? `KEY_${req.apiKey.keyPrefix}` : 'ANONYMOUS',
        msmeId: req.msmeId || req.user?.msmeId || 1,
        action: 'PERMISSION_DENIED',
        severity: 'WARNING',
        status: 'FAILURE',
        ipAddress: req.ip || req.headers['x-forwarded-for'],
        userAgent: req.headers['user-agent'],
        details: { requiredScopes, grantedScopes: req.grantedScopes || [], endpoint: req.originalUrl },
      }).catch(() => {});

      return sendError(res, {
        statusCode: 403,
        errorCode: 'INSUFFICIENT_SCOPES',
        message: `Insufficient permissions. Required scopes: [${requiredScopes.join(', ')}].`,
        details: {
          requiredScopes,
          grantedScopes: req.grantedScopes || [],
        },
      });
    }

    next();
  };
}

module.exports = {
  requireScope,
  requireAllScopes,
};
