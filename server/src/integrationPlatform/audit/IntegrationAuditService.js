/**
 * IntegrationAuditService.js
 * Dedicated audit infrastructure tracking integration actions, key lifecycle events,
 * credential rotations, permission changes, and authentication attempts.
 */
const defaultPrisma = require('../../utils/prismaClient');

class IntegrationAuditService {
  /**
   * Log an auditable integration platform event to PostgreSQL
   */
  async logAuditAction({
    actorType = 'SYSTEM',
    actorId = '0',
    action,
    resourceType,
    resourceId,
    changes = null,
    ipAddress = null,
    userAgent = null,
  }, client = defaultPrisma) {
    if (!action || !resourceType || !resourceId) {
      throw new Error('Audit log requires action, resourceType, and resourceId.');
    }

    console.log(`[IntegrationAudit] Action: ${action} | Resource: ${resourceType}:${resourceId} | Actor: ${actorType}:${actorId}`);

    return client.integrationAuditLog.create({
      data: {
        actor_type: actorType,
        actor_id: String(actorId),
        action,
        resource_type: resourceType,
        resource_id: String(resourceId),
        changes_json: changes ? JSON.parse(JSON.stringify(changes)) : null,
        ip_address: ipAddress,
        user_agent: userAgent,
      },
    });
  }

  /**
   * Fetch audit history for a specific resource
   */
  async getAuditHistory(resourceType, resourceId, client = defaultPrisma) {
    return client.integrationAuditLog.findMany({
      where: {
        resource_type: resourceType,
        resource_id: String(resourceId),
      },
      orderBy: { created_at: 'desc' },
    });
  }
}

module.exports = new IntegrationAuditService();
