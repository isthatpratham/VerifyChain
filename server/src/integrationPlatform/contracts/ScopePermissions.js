/**
 * ScopePermissions.js
 * Fine-grained, extensible API Scope & Permission Model for Enterprise Integration Platform.
 */

const SCOPES = Object.freeze({
  BUSINESS_READ: 'business.read',
  BUSINESS_WRITE: 'business.write',
  COMPLIANCE_READ: 'compliance.read',
  HEALTH_READ: 'health.read',
  TRUST_READ: 'trust.read',
  DISTRIBUTION_READ: 'distribution.read',
  PUBLIC_VERIFY: 'public.verify',
  WEBHOOK_MANAGE: 'webhook.manage',
  INTEGRATION_MANAGE: 'integration.manage',
  DEVELOPER_READ: 'developer.read',
  DEVELOPER_WRITE: 'developer.write',
  APIKEY_MANAGE: 'apikey.manage',
  AUDIT_READ: 'audit.read',
});

const ALL_VALID_SCOPES = new Set(Object.values(SCOPES));

/**
 * Validate that an array of scope strings contains only recognized valid scopes
 */
function validateScopes(scopes = []) {
  if (!Array.isArray(scopes)) return false;
  return scopes.every((scope) => ALL_VALID_SCOPES.has(scope));
}

/**
 * Check if granted scopes contain a required scope
 */
function hasScope(grantedScopes = [], requiredScope) {
  if (!Array.isArray(grantedScopes) || !requiredScope) return false;
  return grantedScopes.includes(requiredScope);
}

/**
 * Check if granted scopes contain all required scopes
 */
function hasAllScopes(grantedScopes = [], requiredScopes = []) {
  if (!Array.isArray(grantedScopes) || !Array.isArray(requiredScopes)) return false;
  return requiredScopes.every((req) => grantedScopes.includes(req));
}

module.exports = {
  SCOPES,
  ALL_VALID_SCOPES: Array.from(ALL_VALID_SCOPES),
  validateScopes,
  hasScope,
  hasAllScopes,
};
