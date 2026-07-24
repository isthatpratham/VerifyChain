/**
 * ConnectorAuditService.js
 * Connector Audit Service logging connector actions to PostgreSQL.
 */
const defaultPrisma = require('../../utils/prismaClient');

class ConnectorAuditService {
  async logAudit({
    actorType = 'SYSTEM',
    actorId = '0',
    action,
    connectionId,
    changes = null,
    ipAddress = null,
  }) {
    console.log(`[ConnectorAudit] Action: ${action} | Connection: ${connectionId} | Actor: ${actorType}:${actorId}`);

    return defaultPrisma.integrationAuditLog.create({
      data: {
        actor_type: actorType,
        actor_id: String(actorId),
        action,
        resource_type: 'IntegrationConnection',
        resource_id: String(connectionId),
        changes_json: changes ? JSON.parse(JSON.stringify(changes)) : null,
        ip_address: ipAddress,
      },
    });
  }
}

module.exports = new ConnectorAuditService();
