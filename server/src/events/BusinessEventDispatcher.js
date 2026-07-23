const EventEmitter = require('events');

class BusinessEventDispatcher extends EventEmitter {
  constructor() {
    super();
    this.EVENTS = {
      BUSINESS_CREATED: 'business:created',
      BUSINESS_UPDATED: 'business:updated',
      BUSINESS_DELETED: 'business:deleted',
      COMPLIANCE_EVALUATED: 'compliance:evaluated',
      RULE_ACTIVATED: 'rule:activated',
      RULE_UPDATED: 'rule:updated',
    };
  }

  /**
   * Emit an internal business event
   */
  emitBusinessEvent(eventType, payload) {
    console.log(`[BusinessEventDispatcher] Event dispatched: ${eventType} (MSME ID: ${payload.msmeId || 'N/A'})`);
    this.emit(eventType, payload);
  }
}

module.exports = new BusinessEventDispatcher();
