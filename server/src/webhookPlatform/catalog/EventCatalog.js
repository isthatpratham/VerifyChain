/**
 * EventCatalog.js
 * Standardized Event Catalog for VerifyChain Webhook & Event Subscription Platform.
 * Categorizes and validates all publishable domain events.
 */

const EVENT_CATALOG = Object.freeze({
  // Business Domain
  BUSINESS_CREATED: 'BusinessCreated',
  BUSINESS_UPDATED: 'BusinessUpdated',
  BUSINESS_VERIFIED: 'BusinessVerified',

  // Compliance Domain
  COMPLIANCE_CREATED: 'ComplianceCreated',
  COMPLIANCE_UPDATED: 'ComplianceUpdated',
  COMPLIANCE_RENEWED: 'ComplianceRenewed',
  COMPLIANCE_EXPIRED: 'ComplianceExpired',
  COMPLIANCE_HEALTH_CALCULATED: 'ComplianceHealthCalculated',
  COMPLIANCE_HEALTH_CHANGED: 'ComplianceHealthChanged',

  // Supplier Trust Domain
  SUPPLIER_TRUST_CREATED: 'SupplierTrustCreated',
  SUPPLIER_TRUST_PUBLISHED: 'SupplierTrustPublished',
  SUPPLIER_TRUST_UPDATED: 'SupplierTrustUpdated',
  SUPPLIER_TRUST_SCORE_CHANGED: 'SupplierTrustScoreChanged',

  // Trust Distribution Domain
  DISTRIBUTION_CREATED: 'DistributionCreated',
  DISTRIBUTION_PUBLISHED: 'DistributionPublished',
  QR_CODE_GENERATED: 'QRCodeGenerated',
  TRUST_ASSET_GENERATED: 'TrustAssetGenerated',
  PUBLIC_PROFILE_PUBLISHED: 'PublicProfilePublished',

  // Integration & Developer Platform
  INTEGRATION_CONNECTED: 'IntegrationConnected',
  INTEGRATION_DISCONNECTED: 'IntegrationDisconnected',
  API_KEY_CREATED: 'APIKeyCreated',
  API_KEY_REVOKED: 'APIKeyRevoked',
  DEVELOPER_APP_CREATED: 'DeveloperApplicationCreated',

  // Webhook Platform Meta-events
  WEBHOOK_CREATED: 'WebhookCreated',
  WEBHOOK_UPDATED: 'WebhookUpdated',
  WEBHOOK_DELETED: 'WebhookDeleted',
  WEBHOOK_PING: 'WebhookPingTest',
});

const ALL_EVENTS_SET = new Set(Object.values(EVENT_CATALOG));

/**
 * List all supported event names in catalog
 */
function listAllEvents() {
  return Array.from(ALL_EVENTS_SET);
}

/**
 * Check if an event name is valid and supported
 */
function validateEventName(eventName) {
  return ALL_EVENTS_SET.has(eventName);
}

/**
 * Validate array of event names
 */
function validateEventList(eventList = []) {
  if (!Array.isArray(eventList)) return false;
  return eventList.every((evt) => ALL_EVENTS_SET.has(evt));
}

/**
 * Resolve high-level category for an event
 */
function getEventCategory(eventName) {
  if (eventName.startsWith('Business')) return 'BUSINESS';
  if (eventName.startsWith('Compliance')) return 'COMPLIANCE';
  if (eventName.startsWith('SupplierTrust')) return 'TRUST';
  if (eventName.startsWith('Distribution') || eventName.includes('QR') || eventName.includes('Asset') || eventName.includes('Public')) return 'DISTRIBUTION';
  if (eventName.startsWith('Integration') || eventName.startsWith('APIKey') || eventName.startsWith('Developer')) return 'DEVELOPER';
  if (eventName.startsWith('Webhook')) return 'WEBHOOK';
  return 'GENERAL';
}

module.exports = {
  EVENT_CATALOG,
  listAllEvents,
  validateEventName,
  validateEventList,
  getEventCategory,
};
