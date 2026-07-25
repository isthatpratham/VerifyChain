/**
 * AuditService.js
 * Centralized Enterprise Audit Service for VerifyChain.
 * Handles audit log querying, filtering, search, pagination, bookmarking, and export formatting.
 */

const defaultPrisma = require('../utils/prismaClient');

class AuditService {
  /**
   * Search and filter audit logs with pagination and bookmarked state
   */
  async searchAuditLogs({
    msmeId = 1,
    module = '',
    action = '',
    resourceType = '',
    severity = '',
    status = '',
    startDate = null,
    endDate = null,
    search = '',
    page = 1,
    limit = 50,
  }) {
    const parsedMsmeId = msmeId ? parseInt(msmeId, 10) : 1;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const take = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 500);
    const skip = (pageNum - 1) * take;

    const where = {};

    if (module && module.toUpperCase() !== 'ALL') {
      where.module = module.toUpperCase();
    }
    if (action) {
      where.action = action;
    }
    if (resourceType) {
      where.resource_type = resourceType;
    }
    if (severity && severity.toUpperCase() !== 'ALL') {
      where.severity = severity.toUpperCase();
    }
    if (status && status.toUpperCase() !== 'ALL') {
      where.status = status.toUpperCase();
    }

    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at.gte = new Date(startDate);
      if (endDate) where.created_at.lte = new Date(endDate);
    }

    // Query database audit logs
    let rawLogs = await defaultPrisma.integrationAuditLog.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: 200, // Fetch top candidate pool for memory search fallback
    });

    // In-memory filter fallback for search query or fields stored in changes_json
    if (search) {
      const q = search.toLowerCase();
      rawLogs = rawLogs.filter((log) => {
        const changesStr = JSON.stringify(log.changes_json || {}).toLowerCase();
        return (
          log.action.toLowerCase().includes(q) ||
          (log.actor_id && log.actor_id.toLowerCase().includes(q)) ||
          (log.module && log.module.toLowerCase().includes(q)) ||
          (log.resource_type && log.resource_type.toLowerCase().includes(q)) ||
          (log.resource_id && log.resource_id.toLowerCase().includes(q)) ||
          (log.severity && log.severity.toLowerCase().includes(q)) ||
          (log.status && log.status.toLowerCase().includes(q)) ||
          (log.ip_address && log.ip_address.toLowerCase().includes(q)) ||
          changesStr.includes(q)
        );
      });
    }

    const total = rawLogs.length;
    const paginatedLogs = rawLogs.slice(skip, skip + take);

    // Fetch user bookmarks for this MSME
    const bookmarks = await defaultPrisma.auditBookmark.findMany({
      where: { msme_id: parsedMsmeId },
    });
    const bookmarkedSet = new Set(bookmarks.map((b) => b.audit_log_id));
    const bookmarkNoteMap = new Map(bookmarks.map((b) => [b.audit_log_id, b.note]));

    const formattedLogs = paginatedLogs.map((log) => {
      const changes = log.changes_json || {};
      return {
        id: log.id,
        timestamp: log.created_at ? new Date(log.created_at).toISOString() : new Date().toISOString(),
        actorType: log.actor_type || 'SYSTEM',
        actorId: log.actor_id || 'SYSTEM',
        msmeId: log.msme_id || changes.msmeId || parsedMsmeId,
        module: log.module || changes.module || 'SYSTEM',
        action: log.action,
        resourceType: log.resource_type,
        resourceId: log.resource_id,
        severity: log.severity || changes.severity || 'INFO',
        status: log.status || changes.status || 'SUCCESS',
        ipAddress: log.ip_address || changes.ipAddress || '127.0.0.1',
        userAgent: log.user_agent || changes.userAgent || 'VerifyChain-Client/1.0',
        correlationId: log.correlation_id || changes.correlationId || `corr_${log.id}`,
        changesJson: changes,
        isBookmarked: bookmarkedSet.has(log.id),
        bookmarkNote: bookmarkNoteMap.get(log.id) || null,
        formattedDate: new Date(log.created_at).toLocaleString(),
      };
    });

    return {
      logs: formattedLogs,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take) || 1,
      },
    };
  }

  /**
   * Bookmark / Save an audit log record
   */
  async bookmarkAuditLog(msmeId = 1, auditLogId, note = null) {
    const parsedMsmeId = parseInt(msmeId, 10);
    const parsedLogId = parseInt(auditLogId, 10);

    const existing = await defaultPrisma.auditBookmark.findFirst({
      where: { msme_id: parsedMsmeId, audit_log_id: parsedLogId },
    });

    if (existing) return existing;

    return defaultPrisma.auditBookmark.create({
      data: {
        msme_id: parsedMsmeId,
        audit_log_id: parsedLogId,
        note,
      },
    });
  }

  /**
   * Remove audit log bookmark
   */
  async removeBookmark(msmeId = 1, auditLogId) {
    return defaultPrisma.auditBookmark.deleteMany({
      where: {
        msme_id: parseInt(msmeId, 10),
        audit_log_id: parseInt(auditLogId, 10),
      },
    });
  }

  /**
   * Export audit log dataset (JSON or CSV format)
   */
  async exportAuditLogs(filters = {}) {
    const { logs } = await this.searchAuditLogs({ ...filters, limit: 500 });
    const format = (filters.format || 'json').toLowerCase();

    if (format === 'csv') {
      const headers = ['ID', 'Timestamp', 'Module', 'Action', 'Severity', 'Status', 'Actor ID', 'Resource Type', 'Resource ID', 'IP Address', 'Correlation ID'];
      const rows = logs.map((l) => [
        l.id,
        `"${l.timestamp}"`,
        `"${l.module}"`,
        `"${l.action}"`,
        `"${l.severity}"`,
        `"${l.status}"`,
        `"${l.actorId}"`,
        `"${l.resourceType}"`,
        `"${l.resourceId}"`,
        `"${l.ipAddress}"`,
        `"${l.correlationId}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      return { format: 'csv', filename: `verifychain_audit_export_${Date.now()}.csv`, content: csvContent };
    }

    return {
      format: 'json',
      filename: `verifychain_audit_export_${Date.now()}.json`,
      content: JSON.stringify(logs, null, 2),
    };
  }
}

module.exports = new AuditService();
