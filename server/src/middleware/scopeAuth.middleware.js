/**
 * scopeAuth.middleware.js
 * Scope-Based Authorization Middleware.
 * Enforces least privilege per REST endpoint, verifying req.grantedScopes.
 */
const { hasScope, hasAllScopes } = require('../integrationPlatform');
const { sendError } = require('../utils/apiResponse');

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
