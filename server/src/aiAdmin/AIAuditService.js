/**
 * AIAuditService.js
 * AI Governance Audit Events Log & Historical Tracking (Phase 11.4).
 */

const defaultPrisma = require('../utils/prismaClient');

class AIAuditService {
  /**
   * Log AI Governance Audit Event
   */
  static async logEvent({ action, actorId = 'ADMIN', details = {} }, client = defaultPrisma) {
    return await client.aIAdminAuditEvent.create({
      data: {
        action: action.toUpperCase(),
        actor_id: String(actorId),
        details_json: details,
      },
    });
  }

  /**
   * List AI Governance Audit Events
   */
  static async listEvents(limit = 50, client = defaultPrisma) {
    return await client.aIAdminAuditEvent.findMany({
      orderBy: { created_at: 'desc' },
      take: Number(limit),
    });
  }
}

module.exports = AIAuditService;
