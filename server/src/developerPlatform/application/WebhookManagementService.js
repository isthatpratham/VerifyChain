/**
 * WebhookManagementService.js
 * Webhook Platform Management Service.
 * Manages webhook creation, editing, pausing, secret rotation, delivery logs, event replay,
 * and ping testing.
 */
const crypto = require('crypto');
const defaultPrisma = require('../../utils/prismaClient');
const { WebhookDeliveryEngine, WebhookSigner } = require('../../webhookPlatform');

class WebhookManagementService {
  /**
   * Create a Webhook Subscription
   */
  async createSubscription({ developerAppId, targetUrl, subscribedEvents = [] }) {
    const appId = parseInt(developerAppId, 10);

    const subscriptionId = `WH-SUB-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const secret = WebhookSigner.generateSigningSecret();
    const secretHash = crypto.createHash('sha256').update(secret).digest('hex');

    const subscription = await defaultPrisma.webhookSubscription.create({
      data: {
        developer_app_id: appId,
        subscription_id: subscriptionId,
        target_url: targetUrl,
        subscribed_events: subscribedEvents,
        secret_hash: secretHash,
        is_active: true,
      },
    });

    await defaultPrisma.integrationAuditLog.create({
      data: {
        actor_type: 'DEVELOPER',
        actor_id: `APP_${appId}`,
        action: 'WEBHOOK_SUBSCRIPTION_CREATED',
        resource_type: 'WebhookSubscription',
        resource_id: String(subscription.id),
        changes_json: { targetUrl, subscribedEvents },
      },
    });

    return {
      subscription,
      signingSecret: secret, // SHOWN ONCE FOR WEBHOOK SIGNATURE VERIFICATION
    };
  }

  /**
   * List subscriptions
   */
  async listSubscriptions(developerAppId) {
    const appId = parseInt(developerAppId, 10);
    return defaultPrisma.webhookSubscription.findMany({
      where: { developer_app_id: appId },
      orderBy: { created_at: 'desc' },
      include: {
        _count: { select: { deliveries: true } },
      },
    });
  }

  /**
   * Toggle pause/resume status
   */
  async toggleStatus(subscriptionId) {
    const id = parseInt(subscriptionId, 10);
    if (isNaN(id)) {
      throw new Error(`Invalid subscription ID: ${subscriptionId}`);
    }

    const sub = await defaultPrisma.webhookSubscription.findUnique({ where: { id } });
    if (!sub) throw new Error(`Subscription ID ${id} not found.`);

    const updated = await defaultPrisma.webhookSubscription.update({
      where: { id },
      data: { is_active: !sub.is_active },
    });

    return updated;
  }

  /**
   * Rotate Webhook Signing Secret
   */
  async rotateSecret(subscriptionId) {
    const id = parseInt(subscriptionId, 10);
    if (isNaN(id)) {
      throw new Error(`Invalid subscription ID: ${subscriptionId}`);
    }

    const secret = WebhookSigner.generateSigningSecret();
    const secretHash = crypto.createHash('sha256').update(secret).digest('hex');

    await defaultPrisma.webhookSubscription.update({
      where: { id },
      data: { secret_hash: secretHash },
    });

    return { success: true, newSigningSecret: secret };
  }

  /**
   * Replay a failed webhook delivery
   */
  async replayDelivery(deliveryId) {
    const id = parseInt(deliveryId, 10);
    if (isNaN(id)) {
      throw new Error(`Invalid delivery ID: ${deliveryId}`);
    }

    const delivery = await defaultPrisma.webhookDelivery.findUnique({
      where: { id },
      include: { subscription: true },
    });

    if (!delivery) throw new Error(`Delivery ID ${id} not found.`);

    // Reset status to PENDING and trigger execution
    await defaultPrisma.webhookDelivery.update({
      where: { id },
      data: { status: 'PENDING', attempt_count: 0 },
    });

    const result = await WebhookDeliveryEngine.processDelivery(id);
    return result;
  }

  /**
   * Get delivery history and failures
   */
  async getDeliveryLogs(subscriptionId, limit = 50) {
    const id = parseInt(subscriptionId, 10);
    if (isNaN(id)) {
      throw new Error(`Invalid subscription ID: ${subscriptionId}`);
    }

    return defaultPrisma.webhookDelivery.findMany({
      where: { subscription_id: id },
      take: limit,
      orderBy: { created_at: 'desc' },
      include: { attempts: true },
    });
  }
}

module.exports = new WebhookManagementService();
