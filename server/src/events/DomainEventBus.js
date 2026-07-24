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
      BUSINESS_CREATED: 'BusinessCreated',
      BUSINESS_UPDATED: 'BusinessUpdated',
      BUSINESS_DELETED: 'BusinessDeleted',
      COMPLIANCE_CREATED: 'ComplianceCreated',
      COMPLIANCE_EVALUATED: 'ComplianceEvaluated',
      COMPLIANCE_REEVALUATED: 'ComplianceReevaluated',
      COMPLIANCE_STATUS_CHANGED: 'ComplianceStatusChanged',
      COMPLIANCE_RENEWED: 'ComplianceRenewed',
      SCORE_CALCULATION_REQUESTED: 'ScoreCalculationRequested',
      SCORE_CALCULATED: 'ScoreCalculated',
      SCORE_VERSION_ACTIVATED: 'ScoreVersionActivated',
      // Future Integration Events
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
