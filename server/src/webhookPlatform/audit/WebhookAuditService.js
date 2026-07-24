/**
 * WebhookAuditService.js
 * Audit Logging Service for Webhook Platform lifecycle actions.
 */
const defaultPrisma = require('../../utils/prismaClient');

class WebhookAuditService {
  /**
   * Record a webhook audit event in PostgreSQL
   */
  async logAudit({
    actorType = 'SYSTEM',
    actorId = '0',
    action,
    subscriptionId,
    changes = null,
    ipAddress = null,
  }, client = defaultPrisma) {
    if (!action || !subscriptionId) {
      throw new Error('Webhook audit log requires action and subscriptionId.');
    }

    console.log(`[WebhookAudit] Action: ${action} | Subscription: ${subscriptionId} | Actor: ${actorType}:${actorId}`);

    return client.integrationAuditLog.create({
      data: {
        actor_type: actorType,
        actor_id: String(actorId),
        action,
        resource_type: 'WebhookSubscription',
        resource_id: String(subscriptionId),
        changes_json: changes ? JSON.parse(JSON.stringify(changes)) : null,
        ip_address: ipAddress,
      },
    });
  }
}

module.exports = new WebhookAuditService();
