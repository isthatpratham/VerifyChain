/**
 * index.js
 * Master Facade for Webhook & Event Subscriptions Platform Bounded Context (Phase 8.3).
 * Exposes event catalog, signing engine, delivery engine, retry engine, audit service, and event dispatcher.
 */

const { EVENT_CATALOG, listAllEvents, validateEventName, validateEventList, getEventCategory } = require('./catalog/EventCatalog');
const WebhookSigner = require('./security/WebhookSigner');
const WebhookAuditService = require('./audit/WebhookAuditService');
const WebhookDeliveryEngine = require('./engine/WebhookDeliveryEngine');
const WebhookRetryEngine = require('./engine/WebhookRetryEngine');
const WebhookEventDispatcher = require('./engine/WebhookEventDispatcher');

module.exports = {
  // Catalog
  EVENT_CATALOG,
  listAllEvents,
  validateEventName,
  validateEventList,
  getEventCategory,

  // Security & Audit
  WebhookSigner,
  WebhookAuditService,

  // Dispatch & Retry Engines
  WebhookDeliveryEngine,
  WebhookRetryEngine,
  WebhookEventDispatcher,
};
