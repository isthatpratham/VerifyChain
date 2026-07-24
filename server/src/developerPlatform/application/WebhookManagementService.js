/**
 * WebhookManagementService.js
 * Complete Webhook Platform Management Service.
 * Manages creation, editing, deletion, pausing/resuming, secret rotation,
 * endpoint validation, test ping, delivery logs, and event replay.
 */
const crypto = require('crypto');
const defaultPrisma = require('../../utils/prismaClient');
const { WebhookDeliveryEngine, WebhookSigner } = require('../../webhookPlatform');
const ApiKeyManagementService = require('./ApiKeyManagementService');

class WebhookManagementService {
  /**
   * Create a Webhook Subscription
   */
  async createSubscription({ developerAppId, msmeId = 1, targetUrl, subscribedEvents = [] }) {
    if (!targetUrl || (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://'))) {
      throw new Error('Target URL must be a valid HTTP or HTTPS endpoint URL.');
    }

    let appId;
    if (developerAppId) {
      appId = parseInt(developerAppId, 10);
    } else {
      const app = await ApiKeyManagementService._getOrCreateDefaultApp(msmeId);
      appId = app.id;
    }

    const subscriptionId = `WH-SUB-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const secret = WebhookSigner.generateSigningSecret();
    const secretHash = crypto.createHash('sha256').update(secret).digest('hex');

    const subscription = await defaultPrisma.webhookSubscription.create({
      data: {
        developer_app_id: appId,
        subscription_id: subscriptionId,
        target_url: targetUrl,
        subscribed_events: Array.isArray(subscribedEvents) && subscribedEvents.length > 0
          ? subscribedEvents
          : ['SupplierTrustScoreUpdated', 'VerificationCompleted'],
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
        changes_json: { targetUrl, subscribedEvents: subscription.subscribed_events },
      },
    });

    return {
      subscription,
      signingSecret: secret, // SHOWN ONCE FOR SIGNATURE VERIFICATION
    };
  }

  /**
   * List subscriptions for an App or MSME
   */
  async listSubscriptions({ developerAppId, msmeId = 1 } = {}) {
    let whereClause = {};
    if (developerAppId) {
      whereClause.developer_app_id = parseInt(developerAppId, 10);
    } else {
      const app = await ApiKeyManagementService._getOrCreateDefaultApp(msmeId);
      whereClause.developer_app_id = app.id;
    }

    const subscriptions = await defaultPrisma.webhookSubscription.findMany({
      where: whereClause,
      orderBy: { created_at: 'desc' },
      include: {
        _count: { select: { deliveries: true } },
      },
    });

    return subscriptions.map((s) => ({
      ...s,
      totalDeliveriesCount: s._count?.deliveries || 0,
    }));
  }

  /**
   * Update subscription properties (target URL, subscribed events)
   */
  async updateSubscription(subscriptionId, { targetUrl, subscribedEvents, is_active }) {
    const id = parseInt(subscriptionId, 10);
    const existing = await defaultPrisma.webhookSubscription.findUnique({ where: { id } });
    if (!existing) throw new Error(`Webhook Subscription ID ${id} not found.`);

    const updateData = {};
    if (targetUrl) {
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        throw new Error('Target URL must be a valid HTTP or HTTPS endpoint URL.');
      }
      updateData.target_url = targetUrl;
    }
    if (Array.isArray(subscribedEvents)) {
      updateData.subscribed_events = subscribedEvents;
    }
    if (typeof is_active === 'boolean') {
      updateData.is_active = is_active;
    }

    const updated = await defaultPrisma.webhookSubscription.update({
      where: { id },
      data: updateData,
    });

    await defaultPrisma.integrationAuditLog.create({
      data: {
        actor_type: 'DEVELOPER',
        actor_id: `APP_${existing.developer_app_id}`,
        action: 'WEBHOOK_SUBSCRIPTION_UPDATED',
        resource_type: 'WebhookSubscription',
        resource_id: String(id),
        changes_json: updateData,
      },
    });

    return updated;
  }

  /**
   * Toggle pause/resume status
   */
  async toggleStatus(subscriptionId) {
    const id = parseInt(subscriptionId, 10);
    if (isNaN(id)) throw new Error(`Invalid subscription ID: ${subscriptionId}`);

    const sub = await defaultPrisma.webhookSubscription.findUnique({ where: { id } });
    if (!sub) throw new Error(`Subscription ID ${id} not found.`);

    const updated = await defaultPrisma.webhookSubscription.update({
      where: { id },
      data: { is_active: !sub.is_active },
    });

    await defaultPrisma.integrationAuditLog.create({
      data: {
        actor_type: 'DEVELOPER',
        actor_id: `APP_${sub.developer_app_id}`,
        action: updated.is_active ? 'WEBHOOK_RESUMED' : 'WEBHOOK_PAUSED',
        resource_type: 'WebhookSubscription',
        resource_id: String(id),
        changes_json: { is_active: updated.is_active },
      },
    });

    return updated;
  }

  /**
   * Rotate Webhook Signing Secret
   */
  async rotateSecret(subscriptionId) {
    const id = parseInt(subscriptionId, 10);
    if (isNaN(id)) throw new Error(`Invalid subscription ID: ${subscriptionId}`);

    const sub = await defaultPrisma.webhookSubscription.findUnique({ where: { id } });
    if (!sub) throw new Error(`Subscription ID ${id} not found.`);

    const secret = WebhookSigner.generateSigningSecret();
    const secretHash = crypto.createHash('sha256').update(secret).digest('hex');

    await defaultPrisma.webhookSubscription.update({
      where: { id },
      data: { secret_hash: secretHash },
    });

    await defaultPrisma.integrationAuditLog.create({
      data: {
        actor_type: 'DEVELOPER',
        actor_id: `APP_${sub.developer_app_id}`,
        action: 'WEBHOOK_SECRET_ROTATED',
        resource_type: 'WebhookSubscription',
        resource_id: String(id),
        changes_json: { rotated_at: new Date() },
      },
    });

    return { success: true, newSigningSecret: secret };
  }

  /**
   * Trigger Test Ping Event Delivery
   */
  async sendTestPing(subscriptionId) {
    const id = parseInt(subscriptionId, 10);
    const sub = await defaultPrisma.webhookSubscription.findUnique({ where: { id } });
    if (!sub) throw new Error(`Subscription ID ${id} not found.`);

    const testEvent = {
      eventId: `evt_ping_${Date.now()}`,
      eventType: 'ping.test',
      timestamp: new Date().toISOString(),
      data: { message: 'VerifyChain Webhook Ping Test', subscriptionId: sub.subscription_id },
    };

    const delivery = await defaultPrisma.webhookDelivery.create({
      data: {
        subscription_id: sub.id,
        event_type: 'ping.test',
        event_id: testEvent.eventId,
        payload_json: testEvent,
        status: 'PENDING',
        attempt_count: 0,
      },
    });

    const result = await WebhookDeliveryEngine.processDelivery(delivery.id);
    return result;
  }

  /**
   * Delete Webhook Subscription
   */
  async deleteSubscription(subscriptionId) {
    const id = parseInt(subscriptionId, 10);
    const sub = await defaultPrisma.webhookSubscription.findUnique({ where: { id } });
    if (!sub) throw new Error(`Subscription ID ${id} not found.`);

    // Cascade delete attempts and deliveries
    const deliveries = await defaultPrisma.webhookDelivery.findMany({ where: { subscription_id: id }, select: { id: true } });
    const deliveryIds = deliveries.map(d => d.id);

    if (deliveryIds.length > 0) {
      await defaultPrisma.webhookAttempt.deleteMany({ where: { delivery_id: { in: deliveryIds } } });
      await defaultPrisma.webhookDelivery.deleteMany({ where: { subscription_id: id } });
    }

    await defaultPrisma.webhookSubscription.delete({ where: { id } });

    await defaultPrisma.integrationAuditLog.create({
      data: {
        actor_type: 'DEVELOPER',
        actor_id: `APP_${sub.developer_app_id}`,
        action: 'WEBHOOK_SUBSCRIPTION_DELETED',
        resource_type: 'WebhookSubscription',
        resource_id: String(id),
        changes_json: { target_url: sub.target_url, subscription_id: sub.subscription_id },
      },
    });

    return { success: true, message: `Webhook Subscription ${sub.subscription_id} deleted.` };
  }

  /**
   * Replay a failed webhook delivery
   */
  async replayDelivery(deliveryId) {
    const id = parseInt(deliveryId, 10);
    if (isNaN(id)) throw new Error(`Invalid delivery ID: ${deliveryId}`);

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
   * Get delivery history and retry attempts
   */
  async getDeliveryLogs(subscriptionId, limit = 50) {
    const id = parseInt(subscriptionId, 10);
    if (isNaN(id)) throw new Error(`Invalid subscription ID: ${subscriptionId}`);

    return defaultPrisma.webhookDelivery.findMany({
      where: { subscription_id: id },
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        attempts: {
          orderBy: { attempted_at: 'desc' },
        },
      },
    });
  }
}

module.exports = new WebhookManagementService();
