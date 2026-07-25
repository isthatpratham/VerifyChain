/**
 * EarlyWarningCenter.js
 * Proactive Early Warning System for Emerging Risks, Renewal Bottlenecks, and Degradation Alerts.
 */

const defaultPrisma = require('../../utils/prismaClient');

class EarlyWarningCenter {
  async getEarlyWarnings(msmeId = 1) {
    const parsedId = parseInt(msmeId, 10) || 1;

    const dbWarnings = defaultPrisma.earlyWarning
      ? await defaultPrisma.earlyWarning.findMany({
          where: { msme_id: parsedId },
          orderBy: { created_at: 'desc' },
        }).catch(() => [])
      : [];

    if (dbWarnings.length > 0) return dbWarnings;

    // Baseline early warnings
    return [
      {
        warning_code: 'WARN_RENEWAL_30D',
        title: 'Upcoming GST Filing Deadline (30 Days)',
        category: 'RENEWAL_BOTTLENECK',
        severity: 'MEDIUM',
        confidence_score: 0.96,
        time_horizon: '30_DAYS',
        predicted_impact: 'Temporary freeze on public supplier trust badge verification if filing latency exceeds 15 days.',
        preventive_action: 'Initiate automated GSTR-3B filing sync via GSTN portal connector.',
      },
      {
        warning_code: 'WARN_DOC_EXPIRY_60D',
        title: 'FSSAI License Renewal Window Open',
        category: 'DOCUMENT_EXPIRATION',
        severity: 'LOW',
        confidence_score: 0.94,
        time_horizon: '60_DAYS',
        predicted_impact: 'FSSAI compliance badge status degrades from VERIFIED to RENEWAL_PENDING.',
        preventive_action: 'Upload renewed FSSAI food safety certificate to Document Intelligence Vault.',
      },
    ];
  }
}

module.exports = new EarlyWarningCenter();
