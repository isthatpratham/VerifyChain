/**
 * AuditContextBuilder.js
 * Audit Telemetry Context Builder.
 */

const defaultPrisma = require('../../../utils/prismaClient');

class AuditContextBuilder {
  async buildContext({ msmeId = 1 }) {
    const parsedId = parseInt(msmeId, 10) || 1;
    const recentLogs = defaultPrisma.integrationAuditLog
      ? await defaultPrisma.integrationAuditLog.findMany({
          where: { msme_id: parsedId },
          take: 5,
          orderBy: { created_at: 'desc' },
        }).catch(() => [])
      : [];

    return {
      msmeId: parsedId,
      recentAuditEventsCount: recentLogs.length,
      recentActions: recentLogs.map((l) => ({ action: l.action, module: l.module, timestamp: l.created_at })),
    };
  }
}

module.exports = new AuditContextBuilder();
