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
   * Emit an internal business event and forward to DomainEventBus
   */
  emitBusinessEvent(eventType, payload) {
    console.log(`[BusinessEventDispatcher] Event dispatched: ${eventType} (MSME ID: ${payload.msmeId || 'N/A'})`);
    this.emit(eventType, payload);

    try {
      const domainEventBus = require('./DomainEventBus');
      if (eventType === this.EVENTS.BUSINESS_CREATED) {
        domainEventBus.publish(domainEventBus.EVENTS.BUSINESS_CREATED, payload);
      } else if (eventType === this.EVENTS.BUSINESS_UPDATED) {
        domainEventBus.publish(domainEventBus.EVENTS.BUSINESS_UPDATED, payload);
      }
    } catch (err) {
      console.warn(`[BusinessEventDispatcher] DomainEventBus forwarding notice: ${err.message}`);
    }
  }
}

module.exports = new BusinessEventDispatcher();
