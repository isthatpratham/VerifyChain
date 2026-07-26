/**
 * RetentionPolicyEngine.js
 * Configurable Retention Policy Engine for Enterprise Vault (Phase 10.5).
 */

const defaultPrisma = require('../../utils/prismaClient');

const DEFAULT_POLICIES = [
  { name: 'GST & Tax Filings Policy', code: 'POL_GST_8Y', scope: 'COMPLIANCE', category: 'COMPLIANCE', document_type: 'GST_RETURN', retention_days: 2920, archive_action: 'AUTO_ARCHIVE', disposition_action: 'REVIEW_REQUIRED', description: '8 Year mandatory retention for GST returns & tax audit filings.' },
  { name: 'PAN & KYC Identification Policy', code: 'POL_KYC_PERM', scope: 'COMPLIANCE', category: 'COMPLIANCE', document_type: 'PAN_CARD', retention_days: 36500, archive_action: 'NONE', disposition_action: 'PERMANENT_RETAIN', description: 'Permanent retention policy for corporate & individual KYC identities.' },
  { name: 'Financial Statements Policy', code: 'POL_FIN_7Y', scope: 'CATEGORY', category: 'FINANCIAL', document_type: 'BALANCE_SHEET', retention_days: 2555, archive_action: 'AUTO_ARCHIVE', disposition_action: 'REVIEW_REQUIRED', description: '7 Year statutory retention for annual financial statements & ledger audits.' },
  { name: 'Legal Agreements Policy', code: 'POL_LEG_10Y', scope: 'CATEGORY', category: 'LEGAL', document_type: 'AGREEMENT', retention_days: 3650, archive_action: 'AUTO_ARCHIVE', disposition_action: 'REVIEW_REQUIRED', description: '10 Year retention for executed legal contracts and court settlements.' },
  { name: 'Supplier Contracts Policy', code: 'POL_SUPP_5Y', scope: 'CATEGORY', category: 'SUPPLIER', document_type: 'VENDOR_CONTRACT', retention_days: 1825, archive_action: 'AUTO_ARCHIVE', disposition_action: 'REVIEW_REQUIRED', description: '5 Year retention for active vendor agreements & procurement SLAs.' },
  { name: 'System & Audit Logs Policy', code: 'POL_LOG_3Y', scope: 'GLOBAL', category: 'SYSTEM', document_type: 'SYSTEM_LOG', retention_days: 1095, archive_action: 'AUTO_ARCHIVE', disposition_action: 'AUTO_DESTROY', description: '3 Year retention for automated system security & access logs.' },
];

class RetentionPolicyEngine {
  /**
   * Seed Default Standard Enterprise Retention Policies
   */
  static async seedDefaultPolicies(msmeId = 1, client = defaultPrisma) {
    const existing = await client.vaultRetentionPolicy.findMany({ where: { msme_id: msmeId } });
    if (existing.length >= DEFAULT_POLICIES.length) return existing;

    for (const p of DEFAULT_POLICIES) {
      await client.vaultRetentionPolicy.upsert({
        where: { code: p.code },
        update: {},
        create: { ...p, msme_id: msmeId },
      });
    }

    return await client.vaultRetentionPolicy.findMany({ where: { msme_id: msmeId } });
  }

  /**
   * Create Custom Retention Policy
   */
  static async createPolicy(policyData, client = defaultPrisma) {
    const policy = await client.vaultRetentionPolicy.create({
      data: {
        msme_id: policyData.msmeId || 1,
        name: policyData.name,
        code: policyData.code ? `${policyData.code}_${Date.now()}` : `POL_CUSTOM_${Date.now()}`,
        description: policyData.description,
        scope: policyData.scope || 'ORGANIZATION',
        category: policyData.category,
        document_type: policyData.documentType,
        retention_days: Number(policyData.retentionDays || 365),
        archive_action: policyData.archiveAction || 'AUTO_ARCHIVE',
        disposition_action: policyData.dispositionAction || 'REVIEW_REQUIRED',
        notification_days: Number(policyData.notificationDays || 30),
        created_by: policyData.createdBy || 'SYSTEM',
      },
    });

    return policy;
  }

  /**
   * List Active Retention Policies
   */
  static async listPolicies(msmeId = 1, client = defaultPrisma) {
    await this.seedDefaultPolicies(msmeId, client);
    return await client.vaultRetentionPolicy.findMany({
      where: { msme_id: msmeId, is_active: true },
      orderBy: { created_at: 'desc' },
    });
  }
}

module.exports = RetentionPolicyEngine;
