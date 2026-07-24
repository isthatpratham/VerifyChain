/**
 * webhook.routes.js
 * Webhook & Event Subscription REST API (/api/v1/webhooks).
 * Enables creating, updating, pausing, resuming, deleting subscriptions,
 * rotating secrets, testing endpoints, inspecting delivery logs, and replaying deliveries.
 */
const express = require('express');
const router = express.Router();
const {
  WebhookSigner,
  WebhookAuditService,
  WebhookDeliveryEngine,
  WebhookRetryEngine,
  listAllEvents,
  validateEventList,
} = require('../../../webhookPlatform');
const { webhookSubscriptionRepository, developerAppRepository } = require('../../../repositories');
const defaultPrisma = require('../../../utils/prismaClient');
const { sendSuccess, sendError } = require('../../../utils/apiResponse');
const { parseQueryParams, createPaginationMeta } = require('../../../utils/apiQueryParams');
const apiKeyAuthMiddleware = require('../../../middleware/apiKeyAuth.middleware');
const { requireScope } = require('../../../middleware/scopeAuth.middleware');

router.use(apiKeyAuthMiddleware());

/**
 * GET /api/v1/webhooks/catalog
 * List all publishable events in catalog
 */
router.get('/catalog', requireScope('webhook.manage'), (req, res) => {
  return sendSuccess(res, {
    statusCode: 200,
    data: {
      supportedEvents: listAllEvents(),
    },
  });
});

/**
 * POST /api/v1/webhooks
 * Create a new webhook subscription
 * Scope: webhook.manage
 */
router.post('/', requireScope('webhook.manage'), async (req, res) => {
  try {
    const { developerAppId, targetUrl, subscribedEvents } = req.body;

    if (!targetUrl || typeof targetUrl !== 'string' || !targetUrl.startsWith('http')) {
      return sendError(res, { statusCode: 400, errorCode: 'INVALID_URL', message: 'Valid HTTP/HTTPS targetUrl is required.' });
    }

    const events = Array.isArray(subscribedEvents) && subscribedEvents.length > 0 ? subscribedEvents : ['*'];
    if (events[0] !== '*' && !validateEventList(events)) {
      return sendError(res, { statusCode: 400, errorCode: 'INVALID_EVENTS', message: 'One or more subscribed events are unrecognized.' });
    }

    const appId = parseInt(developerAppId || (req.developerApp ? req.developerApp.id : 1), 10);
    const devApp = await developerAppRepository.findById(appId);

    if (!devApp) {
      return sendError(res, { statusCode: 404, errorCode: 'APP_NOT_FOUND', message: `Developer Application ID ${appId} not found.` });
    }

    const subscriptionId = `WH-SUB-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const signingSecret = WebhookSigner.generateSigningSecret();

    const subscription = await webhookSubscriptionRepository.create({
      developer_app_id: devApp.id,
      subscription_id: subscriptionId,
      target_url: targetUrl.trim(),
      subscribed_events: events,
      secret_hash: signingSecret,
      is_active: true,
    });

    await WebhookAuditService.logAudit({
      actorType: 'SYSTEM',
      actorId: String(devApp.msme_id),
      action: 'WEBHOOK_CREATED',
      subscriptionId: subscription.subscription_id,
      changes: { targetUrl: subscription.target_url, events },
    });

    return sendSuccess(res, {
      statusCode: 201,
      data: {
        id: subscription.id,
        subscriptionId: subscription.subscription_id,
        developerAppId: subscription.developer_app_id,
        targetUrl: subscription.target_url,
        subscribedEvents: subscription.subscribed_events,
        isActive: subscription.is_active,
        createdAt: subscription.created_at,
        // RETURN RAW SIGNING SECRET ONLY ONCE
        signingSecret,
        warning: 'Store this webhook signing secret safely. It will NEVER be shown again.',
      },
    });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'WEBHOOK_CREATE_ERROR', message: 'Failed to create webhook subscription.', details: err.message });
  }
});

/**
 * GET /api/v1/webhooks
 * List subscriptions
 * Scope: webhook.manage
 */
router.get('/', requireScope('webhook.manage'), async (req, res) => {
  try {
    const queryParams = parseQueryParams(req.query, ['id', 'created_at']);
    const appId = req.query.developerAppId ? parseInt(req.query.developerAppId, 10) : req.developerApp?.id;

    const where = {};
    if (appId) where.developer_app_id = appId;

    const [subscriptions, total] = await Promise.all([
      defaultPrisma.webhookSubscription.findMany({
        where,
        orderBy: queryParams.orderBy,
        skip: queryParams.skip,
        take: queryParams.limit,
      }),
      defaultPrisma.webhookSubscription.count({ where }),
    ]);

    // Sanitize secret_hash
    const sanitized = subscriptions.map((s) => ({
      id: s.id,
      subscriptionId: s.subscription_id,
      developerAppId: s.developer_app_id,
      targetUrl: s.target_url,
      subscribedEvents: s.subscribed_events,
      isActive: s.is_active,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
    }));

    const pagination = createPaginationMeta(total, queryParams.page, queryParams.limit);

    return sendSuccess(res, { statusCode: 200, data: sanitized, pagination });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'WEBHOOK_FETCH_ERROR', message: 'Failed to fetch webhook subscriptions.', details: err.message });
  }
});

/**
 * GET /api/v1/webhooks/:id
 * Retrieve subscription by ID
 */
router.get('/:id', requireScope('webhook.manage'), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const sub = await defaultPrisma.webhookSubscription.findUnique({ where: { id } });

    if (!sub) {
      return sendError(res, { statusCode: 404, errorCode: 'SUBSCRIPTION_NOT_FOUND', message: `Webhook subscription ID ${id} not found.` });
    }

    return sendSuccess(res, {
      statusCode: 200,
      data: {
        id: sub.id,
        subscriptionId: sub.subscription_id,
        developerAppId: sub.developer_app_id,
        targetUrl: sub.target_url,
        subscribedEvents: sub.subscribed_events,
        isActive: sub.is_active,
        createdAt: sub.created_at,
        updatedAt: sub.updated_at,
      },
    });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'WEBHOOK_FETCH_ERROR', message: 'Failed to fetch subscription.', details: err.message });
  }
});

/**
 * PATCH /api/v1/webhooks/:id
 * Update subscription
 */
router.patch('/:id', requireScope('webhook.manage'), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { targetUrl, subscribedEvents, isActive } = req.body;

    const sub = await defaultPrisma.webhookSubscription.findUnique({ where: { id } });
    if (!sub) {
      return sendError(res, { statusCode: 404, errorCode: 'SUBSCRIPTION_NOT_FOUND', message: `Webhook subscription ID ${id} not found.` });
    }

    const updateData = {};
    if (targetUrl) updateData.target_url = targetUrl.trim();
    if (Array.isArray(subscribedEvents)) updateData.subscribed_events = subscribedEvents;
    if (typeof isActive === 'boolean') updateData.is_active = isActive;

    const updated = await defaultPrisma.webhookSubscription.update({
      where: { id },
      data: updateData,
    });

    await WebhookAuditService.logAudit({
      actorType: 'SYSTEM',
      actorId: String(sub.developer_app_id),
      action: 'WEBHOOK_UPDATED',
      subscriptionId: sub.subscription_id,
      changes: updateData,
    });

    return sendSuccess(res, { statusCode: 200, data: updated });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'WEBHOOK_UPDATE_ERROR', message: 'Failed to update subscription.', details: err.message });
  }
});

/**
 * DELETE /api/v1/webhooks/:id
 * Delete subscription
 */
router.delete('/:id', requireScope('webhook.manage'), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const sub = await defaultPrisma.webhookSubscription.findUnique({ where: { id } });

    if (!sub) {
      return sendError(res, { statusCode: 404, errorCode: 'SUBSCRIPTION_NOT_FOUND', message: `Webhook subscription ID ${id} not found.` });
    }

    await defaultPrisma.webhookSubscription.delete({ where: { id } });

    await WebhookAuditService.logAudit({
      actorType: 'SYSTEM',
      actorId: String(sub.developer_app_id),
      action: 'WEBHOOK_DELETED',
      subscriptionId: sub.subscription_id,
    });

    return sendSuccess(res, { statusCode: 200, data: { message: `Subscription ${sub.subscription_id} deleted.` } });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'WEBHOOK_DELETE_ERROR', message: 'Failed to delete subscription.', details: err.message });
  }
});

/**
 * POST /api/v1/webhooks/:id/pause
 * Pause event delivery
 */
router.post('/:id/pause', requireScope('webhook.manage'), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updated = await defaultPrisma.webhookSubscription.update({
      where: { id },
      data: { is_active: false },
    });

    await WebhookAuditService.logAudit({
      actorType: 'SYSTEM',
      actorId: String(updated.developer_app_id),
      action: 'WEBHOOK_PAUSED',
      subscriptionId: updated.subscription_id,
    });

    return sendSuccess(res, { statusCode: 200, data: { subscriptionId: updated.subscription_id, isActive: false } });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'PAUSE_ERROR', message: 'Failed to pause subscription.', details: err.message });
  }
});

/**
 * POST /api/v1/webhooks/:id/resume
 * Resume event delivery
 */
router.post('/:id/resume', requireScope('webhook.manage'), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updated = await defaultPrisma.webhookSubscription.update({
      where: { id },
      data: { is_active: true },
    });

    await WebhookAuditService.logAudit({
      actorType: 'SYSTEM',
      actorId: String(updated.developer_app_id),
      action: 'WEBHOOK_RESUMED',
      subscriptionId: updated.subscription_id,
    });

    return sendSuccess(res, { statusCode: 200, data: { subscriptionId: updated.subscription_id, isActive: true } });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'RESUME_ERROR', message: 'Failed to resume subscription.', details: err.message });
  }
});

/**
 * POST /api/v1/webhooks/:id/rotate-secret
 * Rotate HMAC signing secret
 */
router.post('/:id/rotate-secret', requireScope('webhook.manage'), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const newSecret = WebhookSigner.generateSigningSecret();

    const updated = await defaultPrisma.webhookSubscription.update({
      where: { id },
      data: { secret_hash: newSecret },
    });

    await WebhookAuditService.logAudit({
      actorType: 'SYSTEM',
      actorId: String(updated.developer_app_id),
      action: 'WEBHOOK_SECRET_ROTATED',
      subscriptionId: updated.subscription_id,
    });

    return sendSuccess(res, {
      statusCode: 200,
      data: {
        subscriptionId: updated.subscription_id,
        signingSecret: newSecret,
        warning: 'Store this new webhook signing secret safely. It will NEVER be shown again.',
      },
    });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'ROTATE_ERROR', message: 'Failed to rotate signing secret.', details: err.message });
  }
});

/**
 * POST /api/v1/webhooks/:id/ping
 * Dispatch test ping event
 */
router.post('/:id/ping', requireScope('webhook.manage'), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const sub = await defaultPrisma.webhookSubscription.findUnique({ where: { id } });

    if (!sub) {
      return sendError(res, { statusCode: 404, errorCode: 'SUBSCRIPTION_NOT_FOUND', message: `Webhook subscription ID ${id} not found.` });
    }

    const testPayload = {
      event: 'WebhookPingTest',
      contractVersion: 'v1.0.0',
      timestamp: new Date().toISOString(),
      data: { message: 'VerifyChain Webhook Ping Test Successful' },
    };

    const deliveryResult = await WebhookDeliveryEngine.dispatchDelivery(sub, testPayload);

    await WebhookAuditService.logAudit({
      actorType: 'SYSTEM',
      actorId: String(sub.developer_app_id),
      action: 'WEBHOOK_TEST_PINGED',
      subscriptionId: sub.subscription_id,
      changes: { result: deliveryResult.status },
    });

    return sendSuccess(res, { statusCode: 200, data: deliveryResult });
  } catch (err) {
    console.error('[WebhookPingError]:', err);
    return sendError(res, { statusCode: 500, errorCode: 'PING_ERROR', message: 'Failed to dispatch test ping.', details: err.message });
  }
});

/**
 * GET /api/v1/webhooks/:id/deliveries
 * List delivery attempt history for subscription
 */
router.get('/:id/deliveries', requireScope('webhook.manage'), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const queryParams = parseQueryParams(req.query, ['id', 'created_at']);

    const [deliveries, total] = await Promise.all([
      defaultPrisma.webhookDelivery.findMany({
        where: { subscription_id: id },
        include: { attempts: true },
        orderBy: queryParams.orderBy,
        skip: queryParams.skip,
        take: queryParams.limit,
      }),
      defaultPrisma.webhookDelivery.count({ where: { subscription_id: id } }),
    ]);

    const pagination = createPaginationMeta(total, queryParams.page, queryParams.limit);

    return sendSuccess(res, { statusCode: 200, data: deliveries, pagination });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'DELIVERY_FETCH_ERROR', message: 'Failed to fetch delivery history.', details: err.message });
  }
});

/**
 * POST /api/v1/webhooks/deliveries/:deliveryId/replay
 * Replay a past delivery attempt
 */
router.post('/deliveries/:deliveryId/replay', requireScope('webhook.manage'), async (req, res) => {
  try {
    const deliveryId = parseInt(req.params.deliveryId, 10);
    const replayResult = await WebhookRetryEngine.replayDelivery(deliveryId);

    return sendSuccess(res, { statusCode: 200, data: replayResult });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'REPLAY_ERROR', message: 'Failed to replay delivery.', details: err.message });
  }
});

module.exports = router;
