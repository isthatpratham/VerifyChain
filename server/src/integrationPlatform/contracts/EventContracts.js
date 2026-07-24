/**
 * EventContracts.js
 * Versioned public integration event contracts for external partners & webhooks.
 * Encapsulates internal implementation details behind clean, immutable schemas.
 */

const INTEGRATION_EVENTS = Object.freeze({
  BUSINESS_UPDATED: 'BusinessUpdated',
  BUSINESS_VERIFIED: 'BusinessVerified',
  COMPLIANCE_UPDATED: 'ComplianceUpdated',
  COMPLIANCE_HEALTH_CALCULATED: 'ComplianceHealthCalculated',
  SUPPLIER_TRUST_PUBLISHED: 'SupplierTrustPublished',
  DISTRIBUTION_PUBLISHED: 'DistributionPublished',
  QR_CODE_GENERATED: 'QRCodeGenerated',
  TRUST_ASSET_GENERATED: 'TrustAssetGenerated',
  PUBLIC_PROFILE_PUBLISHED: 'PublicProfilePublished',
});

const CONTRACT_VERSION = 'v1.0.0';

/**
 * Format a public integration event payload
 */
function createEventPayload(eventType, payloadData = {}, correlationId = null) {
  if (!Object.values(INTEGRATION_EVENTS).includes(eventType)) {
    throw new Error(`Unrecognized integration event type '${eventType}'`);
  }

  const timestamp = new Date().toISOString();
  const eventId = `evt_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  return {
    eventId,
    event: eventType,
    contractVersion: CONTRACT_VERSION,
    timestamp,
    correlationId: correlationId || `corr_${eventId}`,
    data: payloadData,
  };
}

module.exports = {
  INTEGRATION_EVENTS,
  CONTRACT_VERSION,
  createEventPayload,
};
