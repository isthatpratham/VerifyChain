/**
 * DeveloperScopePermissions.js
 * Fine-grained scope definitions and permission checks for Developer Platform (Phase 8.5).
 */

const DEVELOPER_SCOPES = {
  DEVELOPER_READ: 'developer.read',
  DEVELOPER_WRITE: 'developer.write',
  APIKEY_MANAGE: 'apikey.manage',
  WEBHOOK_MANAGE: 'webhook.manage',
  CONNECTOR_MANAGE: 'connector.manage',
  AUDIT_READ: 'audit.read',
  INTEGRATION_ADMIN: 'integration.admin',
};

const ALL_DEVELOPER_SCOPES = Object.values(DEVELOPER_SCOPES);

/**
 * Check if granted scopes include requested permission
 */
function hasDeveloperScope(grantedScopes = [], requiredScope) {
  if (!requiredScope) return true;
  if (grantedScopes.includes(DEVELOPER_SCOPES.INTEGRATION_ADMIN)) return true;
  return grantedScopes.includes(requiredScope);
}

module.exports = {
  DEVELOPER_SCOPES,
  ALL_DEVELOPER_SCOPES,
  hasDeveloperScope,
};
