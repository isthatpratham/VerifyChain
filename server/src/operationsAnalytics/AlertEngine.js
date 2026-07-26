/**
 * AlertEngine.js
 * Configurable Operational Alerts & Event Management (Phase 11.5).
 */

const defaultPrisma = require('../utils/prismaClient');

const DEFAULT_ALERTS = [
  { title: 'Storage Capacity Threshold Baseline', message: 'Vault storage consumption reaches 4.85 GB (48.5% capacity).', severity: 'INFORMATIONAL', category: 'STORAGE' },
  { title: 'AI Quota Monitoring Nominal', message: 'Organization AI request quota usage within standard threshold.', severity: 'INFORMATIONAL', category: 'AI' },
  { title: 'Security Audit Scan Complete', message: 'Zero high-risk authorization violations detected in automated sweep.', severity: 'INFORMATIONAL', category: 'SECURITY' },
];

class AlertEngine {
  /**
   * Seed Initial Operational Alerts
   */
  static async seedAlerts(client = defaultPrisma) {
    const seeded = [];
    for (const a of DEFAULT_ALERTS) {
      const existing = await client.opOperationalAlert.findFirst({ where: { title: a.title } });
      if (!existing) {
        const alert = await client.opOperationalAlert.create({
          data: {
            title: a.title,
            message: a.message,
            severity: a.severity,
            category: a.category,
            status: 'OPEN',
          },
        });
        seeded.push(alert);
      }
    }
    return seeded;
  }

  /**
   * List Operational Alerts
   */
  static async listAlerts(status = null, severity = null, client = defaultPrisma) {
    await this.seedAlerts(client);

    const where = {};
    if (status && status !== 'ALL') where.status = status.toUpperCase();
    if (severity && severity !== 'ALL') where.severity = severity.toUpperCase();

    return await client.opOperationalAlert.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Raise New Operational Alert
   */
  static async raiseAlert({ title, message, severity = 'MEDIUM', category = 'SYSTEM' }, client = defaultPrisma) {
    return await client.opOperationalAlert.create({
      data: {
        title,
        message,
        severity: severity.toUpperCase(),
        category: category.toUpperCase(),
        status: 'OPEN',
      },
    });
  }

  /**
   * Acknowledge / Assign / Resolve Alert
   */
  static async updateAlertState(alertId, { status, acknowledgedBy = null, assignedTo = null }, client = defaultPrisma) {
    const isId = !isNaN(Number(alertId));
    const alert = await client.opOperationalAlert.findFirst({
      where: isId ? { id: Number(alertId) } : { alert_id: String(alertId) },
    });

    if (!alert) throw new Error(`Operational alert '${alertId}' not found.`);

    const statusUpper = status.toUpperCase();
    const data = { status: statusUpper };

    if (statusUpper === 'ACKNOWLEDGED') data.acknowledged_by = String(acknowledgedBy || 'ADMIN');
    if (statusUpper === 'ASSIGNED') data.assigned_to = String(assignedTo || 'SOC_ADMIN');
    if (statusUpper === 'RESOLVED' || statusUpper === 'CLOSED') data.resolved_at = new Date();

    return await client.opOperationalAlert.update({
      where: { id: alert.id },
      data,
    });
  }
}

module.exports = AlertEngine;
