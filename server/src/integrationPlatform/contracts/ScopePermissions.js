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

  // ─── PHASE 9 AI ECOSYSTEM SCOPES ──────────────────────────────────────────
  AI_USE: 'ai.use',
  AI_ADMIN: 'ai.admin',
  AI_ANALYTICS: 'ai.analytics',
  AI_CONFIGURATION: 'ai.configuration',
  AI_COMPLIANCE_READ: 'ai.compliance.read',
  AI_COMPLIANCE_MANAGE: 'ai.compliance.manage',
  AI_RECOMMENDATIONS_READ: 'ai.recommendations.read',
  AI_EXECUTIVE_READ: 'ai.executive.read',
  AI_ANALYTICS_READ: 'ai.analytics.read',
  AI_DOCUMENT_READ: 'ai.document.read',
  AI_DOCUMENT_MANAGE: 'ai.document.manage',
  AI_ASSISTANT_USE: 'ai.assistant.use',
  AI_ASSISTANT_ADMIN: 'ai.assistant.admin',
  AI_ASSISTANT_ANALYTICS: 'ai.assistant.analytics',
  AI_ASSISTANT_REPORTS: 'ai.assistant.reports',
  AI_ASSISTANT_DOCUMENTS: 'ai.assistant.documents',
  AI_PREDICTIONS_READ: 'ai.predictions.read',
  AI_PREDICTIONS_MANAGE: 'ai.predictions.manage',
  AI_FORECASTING_READ: 'ai.forecasting.read',
  AI_SCENARIOS_RUN: 'ai.scenarios.run',
  AI_ALERTS_READ: 'ai.alerts.read',

  // ─── PHASE 10.1 ENTERPRISE DOCUMENT VAULT SCOPES ──────────────────────────
  VAULT_READ: 'vault.read',
  VAULT_UPLOAD: 'vault.upload',
  VAULT_UPDATE: 'vault.update',
  VAULT_ARCHIVE: 'vault.archive',
  VAULT_DELETE: 'vault.delete',
  VAULT_RESTORE: 'vault.restore',
  VAULT_EXPORT: 'vault.export',
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
