/**
 * DomainEventBus.js
 * Decoupled, strongly-typed internal domain event bus foundation.
 * Supports publishing, subscribing, handler registration, and domain event dispatching.
 */
const EventEmitter = require('events');

class DomainEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);

    // Documented Domain Event Catalog
    this.EVENTS = {
      // Business Events
      BUSINESS_CREATED: 'BusinessCreated',
      BUSINESS_UPDATED: 'BusinessUpdated',
      BUSINESS_DELETED: 'BusinessDeleted',

      // Compliance Events
      COMPLIANCE_CREATED: 'ComplianceCreated',
      COMPLIANCE_EVALUATED: 'ComplianceEvaluated',
      COMPLIANCE_REEVALUATED: 'ComplianceReevaluated',
      COMPLIANCE_STATUS_CHANGED: 'ComplianceStatusChanged',
      COMPLIANCE_RENEWED: 'ComplianceRenewed',

      // Health Score & Intelligence Events
      SCORE_CALCULATION_REQUESTED: 'ScoreCalculationRequested',
      SCORE_CALCULATED: 'ScoreCalculated',
      SCORE_VERSION_ACTIVATED: 'ScoreVersionActivated',
      HEALTH_INSIGHTS_GENERATED: 'HealthInsightsGenerated',
      RECOMMENDATIONS_GENERATED: 'RecommendationsGenerated',
      RISK_ANALYSIS_COMPLETED: 'RiskAnalysisCompleted',

      // Supplier Trust Platform Events (Phases 6.1 – 6.6)
      SUPPLIER_TRUST_PROFILE_CREATED: 'SupplierTrustProfileCreated',
      SUPPLIER_TRUST_PROFILE_UPDATED: 'SupplierTrustProfileUpdated',
      VERIFICATION_REQUESTED: 'VerificationRequested',
      VERIFICATION_APPROVED: 'VerificationApproved',
      VERIFICATION_REJECTED: 'VerificationRejected',
      TRUST_LEVEL_CHANGED: 'TrustLevelChanged',
      TRUST_PROFILE_PUBLISHED: 'TrustProfilePublished',
      TRUST_PROFILE_ARCHIVED: 'TrustProfileArchived',
      FUTURE_QR_GENERATED: 'FutureQRGenerated',
      FUTURE_SUPPLIER_CARD_GENERATED: 'FutureSupplierCardGenerated',
      FUTURE_PUBLIC_VERIFICATION_VIEWED: 'FuturePublicVerificationViewed',

      // Trust Distribution Foundation Events (Phase 7.1)
      DISTRIBUTION_IDENTITY_CREATED: 'SupplierTrustDistributionIdentityCreated',
      DISTRIBUTION_CONFIGURATION_UPDATED: 'SupplierTrustDistributionConfigurationUpdated',
      DISTRIBUTION_VERSION_CREATED: 'SupplierTrustDistributionVersionCreated',
      DISTRIBUTION_PUBLISHED: 'SupplierTrustDistributionPublished',
      DISTRIBUTION_ARCHIVED: 'SupplierTrustDistributionArchived',
      FUTURE_QR_REQUESTED: 'FutureQRRequested',
      FUTURE_BADGE_REQUESTED: 'FutureBadgeRequested',
      FUTURE_CERTIFICATE_REQUESTED: 'FutureCertificateRequested',
      FUTURE_WIDGET_REQUESTED: 'FutureWidgetRequested',

      // Documents & Alerts Events
      DOCUMENT_UPLOADED: 'DocumentUploaded',
      DOCUMENT_VERIFIED: 'DocumentVerified',
      SUPPLIER_VERIFIED: 'SupplierVerified',
      ALERT_TRIGGERED: 'AlertTriggered',
      GOVERNMENT_SCHEME_MATCHED: 'GovernmentSchemeMatched',
    };
  }

  /**
   * Publish a domain event to all registered subscribers
   * @param {string} eventName - Name of the domain event
   * @param {Object} payload - Event payload
   */
  publish(eventName, payload = {}) {
    const timestamp = new Date().toISOString();
    const eventObject = {
      event: eventName,
      timestamp,
      payload,
    };

    console.log(`[DomainEventBus] Published Event: ${eventName} @ ${timestamp}`);
    this.emit(eventName, eventObject);
  }

  /**
   * Subscribe a handler to a specific domain event
   * @param {string} eventName - Name of the domain event
   * @param {Function} handler - Callback handler function
   */
  subscribe(eventName, handler) {
    this.on(eventName, handler);
    return () => this.off(eventName, handler);
  }
}

module.exports = new DomainEventBus();
