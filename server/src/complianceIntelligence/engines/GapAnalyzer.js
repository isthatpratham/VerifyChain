/**
 * GapAnalyzer.js
 * Compliance & Verification Gap Detection Engine.
 * Detects missing registrations, expired/expiring certificates, incomplete profiles, and trust vulnerabilities.
 */

const defaultPrisma = require('../../utils/prismaClient');

class GapAnalyzer {
  /**
   * Analyze platform context data and detect compliance gaps
   * @param {Object} context Unified context payload from AIContextBuilder
   */
  async detectGaps(context = {}) {
    const msmeId = context.msmeId || 1;
    const gaps = [];

    const business = context.business || {};
    const compliance = context.compliance || {};
    const trust = context.trust || {};

    // 1. Profile Completion Gap
    if (business.verificationStatus !== 'VERIFIED') {
      gaps.push({
        gapCode: 'GAP_UNVERIFIED_PROFILE',
        category: 'PROFILE',
        title: 'MSME Business Profile Unverified',
        description: 'Primary business profile has not completed statutory GSTIN/PAN verification.',
        severity: 'HIGH',
        businessImpact: 'Restricts access to enterprise procurement tenders and lowers trust badge score.',
        suggestedResolution: 'Complete Statutory Verification via Government Portal Connector.',
      });
    }

    // 2. Compliance Filing & Expiry Gaps
    if (compliance.pendingRenewals > 0) {
      gaps.push({
        gapCode: 'GAP_EXPIRING_CERTIFICATES',
        category: 'EXPIRY',
        title: `${compliance.pendingRenewals} Compliance Document(s) Pending Renewal`,
        description: 'Statutory compliance certificates are nearing expiry date within 30 days.',
        severity: 'CRITICAL',
        businessImpact: 'Risks regulatory penalty, tax default notice, and suspension of trust profile.',
        suggestedResolution: 'Initiate automated document renewal flow in Compliance workspace.',
      });
    }

    // 3. Trust Profile & Distribution Gap
    if (trust.trustScore < 90) {
      gaps.push({
        gapCode: 'GAP_SUBOPTIMAL_TRUST_SCORE',
        category: 'TRUST',
        title: 'Supplier Trust Score Below Platinum Tier',
        description: `Current trust score of ${trust.trustScore}/100 is below the 90+ Platinum threshold.`,
        severity: 'MEDIUM',
        businessImpact: 'Decreases buyer search ranking on enterprise trust distribution portal.',
        suggestedResolution: 'Connect ERP adapter (SAP/QuickBooks/Tally) to sync verified invoice ledgers.',
      });
    }

    // Default Fallback Gap if zero detected
    if (gaps.length === 0) {
      gaps.push({
        gapCode: 'GAP_CONNECTOR_SYNC_RECOMMENDED',
        category: 'VERIFICATION',
        title: 'Real-Time ERP Ledger Sync Recommended',
        description: 'Connecting an enterprise ERP adapter will automate continuous audit readiness.',
        severity: 'LOW',
        businessImpact: 'Manual filing audits take up to 48 hours without automated connector bridge.',
        suggestedResolution: 'Enable TallyPrime or SAP S/4HANA connector adapter.',
      });
    }

    // Persist detected gaps
    for (const gap of gaps) {
      await defaultPrisma.complianceGap.upsert({
        where: { id: -1 }, // fallback insert pattern
        update: {},
        create: {
          msme_id: msmeId,
          gap_code: gap.gapCode,
          category: gap.category,
          title: gap.title,
          description: gap.description,
          severity: gap.severity,
          business_impact: gap.businessImpact,
          suggested_resolution: gap.suggestedResolution,
        },
      }).catch(() => {});
    }

    return gaps;
  }
}

module.exports = new GapAnalyzer();
