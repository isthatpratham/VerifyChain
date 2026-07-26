/**
 * GovernanceDashboardService.js
 * Governance Workspace Metrics & Reporting Service for Enterprise Vault (Phase 10.5).
 */

const defaultPrisma = require('../../utils/prismaClient');

class GovernanceDashboardService {
  /**
   * Fetch Governance Dashboard Metrics
   */
  static async getGovernanceMetrics(msmeId = 1, client = defaultPrisma) {
    const [totalAssets, activeHolds, archivedAssets, pendingDispositions, policies] = await Promise.all([
      client.vaultAsset.count({ where: { msme_id: msmeId, deleted_flag: false } }),
      client.vaultLegalHold.count({ where: { msme_id: msmeId, status: 'ACTIVE' } }),
      client.vaultAsset.count({ where: { msme_id: msmeId, archived_flag: true } }),
      client.vaultDispositionRecord.count({ where: { msme_id: msmeId, status: 'PENDING_REVIEW' } }),
      client.vaultRetentionPolicy.count({ where: { msme_id: msmeId, is_active: true } }),
    ]);

    const expiringSoon = await client.vaultAsset.count({
      where: {
        msme_id: msmeId,
        retention_expires_at: {
          gte: new Date(),
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Next 30 days
        },
      },
    });

    return {
      totalAssets,
      activeHolds,
      archivedAssets,
      pendingDispositions,
      activePolicies: policies,
      expiringIn30Days: expiringSoon,
      complianceHealthScore: totalAssets > 0 ? Math.round(((totalAssets - pendingDispositions) / totalAssets) * 100) : 100,
    };
  }

  /**
   * Generate Governance Compliance Report
   */
  static async generateReport({ title = 'Governance Compliance Report', reportType = 'RETENTION_COMPLIANCE', msmeId = 1 }, client = defaultPrisma) {
    const metrics = await this.getGovernanceMetrics(msmeId, client);
    const report = await client.vaultGovernanceReport.create({
      data: {
        msme_id: msmeId,
        title,
        report_type: reportType,
        data: metrics,
      },
    });

    return report;
  }
}

module.exports = GovernanceDashboardService;
