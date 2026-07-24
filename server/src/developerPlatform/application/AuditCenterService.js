/**
 * AuditCenterService.js
 * Developer Audit Center Service.
 * Provides searchable audit logs, resource filtering, bookmarking, and event tracking.
 */
const defaultPrisma = require('../../utils/prismaClient');

class AuditCenterService {
  async searchAuditLogs({ msmeId = 1, search = '', action = '', resourceType = '', limit = 50 }) {
    const where = {};

    if (action) where.action = action;
    if (resourceType) where.resource_type = resourceType;

    let logs = await defaultPrisma.integrationAuditLog.findMany({
      where,
      take: limit,
      orderBy: { created_at: 'desc' },
    });

    if (search) {
      const q = search.toLowerCase();
      logs = logs.filter((log) =>
        log.action.toLowerCase().includes(q) ||
        log.actor_id.toLowerCase().includes(q) ||
        log.resource_type.toLowerCase().includes(q) ||
        log.resource_id.toLowerCase().includes(q)
      );
    }

    const bookmarks = await defaultPrisma.auditBookmark.findMany({
      where: { msme_id: parseInt(msmeId, 10) },
    });
    const bookmarkedIds = new Set(bookmarks.map(b => b.audit_log_id));

    return logs.map(l => ({
      ...l,
      isBookmarked: bookmarkedIds.has(l.id),
    }));
  }

  async bookmarkAuditLog(msmeId = 1, auditLogId, note = null) {
    return defaultPrisma.auditBookmark.create({
      data: {
        msme_id: parseInt(msmeId, 10),
        audit_log_id: parseInt(auditLogId, 10),
        note,
      },
    });
  }

  async removeBookmark(msmeId = 1, auditLogId) {
    return defaultPrisma.auditBookmark.deleteMany({
      where: {
        msme_id: parseInt(msmeId, 10),
        audit_log_id: parseInt(auditLogId, 10),
      },
    });
  }
}

module.exports = new AuditCenterService();
