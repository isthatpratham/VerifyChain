/**
 * WebhookEventDispatcher.js
 * Domain Event Dispatcher for Webhook Platform.
 * Subscribes to DomainEventBus and dispatches events asynchronously to matching subscribers.
 */
const domainEventBus = require('../../events/DomainEventBus');
const defaultPrisma = require('../../utils/prismaClient');
const { createEventPayload } = require('../../integrationPlatform');
const { validateEventName } = require('../catalog/EventCatalog');
const WebhookDeliveryEngine = require('./WebhookDeliveryEngine');
const { IntegrationLogger } = require('../../integrationPlatform');

class WebhookEventDispatcher {
  constructor() {
    this.isInitialized = false;
  }

  /**
   * Initialize subscriber binding to DomainEventBus
   */
  initialize() {
    if (this.isInitialized) return;

    domainEventBus.subscribeAll((eventName, eventData) => {
      this.dispatchDomainEvent(eventName, eventData).catch((err) => {
        IntegrationLogger.logEvent('ERROR', `Webhook event dispatch error for '${eventName}': ${err.message}`, {
          event: eventName,
          error: err.message,
        });
      });
    });

    this.isInitialized = true;
    console.log('[WebhookEventDispatcher] Bound to DomainEventBus for outbound notifications.');
  }

  /**
   * Dispatch a published domain event to all matching active webhook subscriptions
   */
  async dispatchDomainEvent(eventName, eventData = {}) {
    if (!validateEventName(eventName)) {
      // Ignore uncatalogued internal events
      return [];
    }

    // Query active subscriptions from DB that listen to eventName or wildcard '*'
    const subscriptions = await defaultPrisma.webhookSubscription.findMany({
      where: {
        is_active: true,
      },
    });

    const matchingSubs = subscriptions.filter((sub) => {
      const events = sub.subscribed_events || [];
      return events.includes('*') || events.includes(eventName);
    });

    if (matchingSubs.length === 0) {
      return [];
    }

    const payload = createEventPayload(eventName, eventData);

    const results = await Promise.allSettled(
      matchingSubs.map((sub) => WebhookDeliveryEngine.dispatchDelivery(sub, payload))
    );

    return results;
  }
}

module.exports = new WebhookEventDispatcher();
