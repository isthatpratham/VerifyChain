/**
 * WebhookRetryEngine.js
 * Exponential Backoff Retry Engine & Dead Letter Queue Manager.
 * Handles retry scheduling, exponential backoff delays, max retry limits, and manual replay capabilities.
 */
const defaultPrisma = require('../../utils/prismaClient');
const WebhookDeliveryEngine = require('./WebhookDeliveryEngine');
const { IntegrationLogger } = require('../../integrationPlatform');

const MAX_RETRIES = 5;
const BACKOFF_SCHEDULE_SECONDS = [10, 30, 300, 1800, 7200]; // 10s, 30s, 5m, 30m, 2h

class WebhookRetryEngine {
  /**
   * Retry a failed delivery attempt with exponential backoff delay
   */
  async retryFailedDelivery(deliveryId) {
    const delivery = await defaultPrisma.webhookDelivery.findUnique({
      where: { id: deliveryId },
      include: { subscription: true },
    });

    if (!delivery || !delivery.subscription) {
      throw new Error(`Delivery ID ${deliveryId} or parent subscription not found.`);
    }

    if (delivery.status === 'DELIVERED') {
      return { status: 'DELIVERED', message: 'Delivery already succeeded.' };
    }

    if (delivery.attempt_count >= MAX_RETRIES) {
      await defaultPrisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: { status: 'PERMANENTLY_FAILED' },
      });

      IntegrationLogger.logEvent('ERROR', `Webhook delivery [${delivery.id}] marked PERMANENTLY_FAILED (Dead Letter Queue)`, {
        deliveryId: delivery.id,
        subscriptionId: delivery.subscription.subscription_id,
        attempts: delivery.attempt_count,
      });

      return { status: 'PERMANENTLY_FAILED', message: 'Max retry limit reached.' };
    }

    const nextAttemptNumber = delivery.attempt_count + 1;
    const backoffSeconds = BACKOFF_SCHEDULE_SECONDS[nextAttemptNumber - 1] || 7200;
    const nextRetryAt = new Date(Date.now() + backoffSeconds * 1000);

    // Update attempt count & next retry timestamp
    await defaultPrisma.webhookDelivery.update({
      where: { id: delivery.id },
      data: {
        status: 'RETRIED',
        attempt_count: nextAttemptNumber,
        next_retry_at: nextRetryAt,
      },
    });

    // Re-dispatch delivery
    const payload = delivery.payload_json;
    const result = await WebhookDeliveryEngine.dispatchDelivery(delivery.subscription, payload, { isReplay: false });

    return result;
  }

  /**
   * Replay a specific delivery manually on-demand
   */
  async replayDelivery(deliveryId) {
    const delivery = await defaultPrisma.webhookDelivery.findUnique({
      where: { id: deliveryId },
      include: { subscription: true },
    });

    if (!delivery || !delivery.subscription) {
      throw new Error(`Delivery ID ${deliveryId} or parent subscription not found.`);
    }

    IntegrationLogger.logEvent('INFO', `Manual replay initiated for delivery [${deliveryId}]`, {
      deliveryId,
      subscriptionId: delivery.subscription.subscription_id,
    });

    const payload = delivery.payload_json;
    return WebhookDeliveryEngine.dispatchDelivery(delivery.subscription, payload, { isReplay: true });
  }
}

module.exports = new WebhookRetryEngine();
