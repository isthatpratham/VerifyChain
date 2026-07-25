/**
 * AuditCenterService.js
 * Developer Audit Center Service Facade.
 * Interfaces with centralized Enterprise AuditService for searchable audit logs, resource filtering, bookmarking, and event tracking.
 */
const AuditService = require('../../audit/AuditService');

class AuditCenterService {
  async searchAuditLogs(params = {}) {
    const result = await AuditService.searchAuditLogs(params);
    // Support legacy array return contract while preserving pagination metadata
    const logsArray = result.logs || [];
    logsArray.pagination = result.pagination;
    return logsArray;
  }

  async bookmarkAuditLog(msmeId = 1, auditLogId, note = null) {
    return AuditService.bookmarkAuditLog(msmeId, auditLogId, note);
  }

  async removeBookmark(msmeId = 1, auditLogId) {
    return AuditService.removeBookmark(msmeId, auditLogId);
  }

  async exportAuditLogs(filters = {}) {
    return AuditService.exportAuditLogs(filters);
  }
}

module.exports = new AuditCenterService();
