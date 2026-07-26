/**
 * QuotaService.js
 * AI Quota Management per User, Organization & Feature Scope (Phase 11.4).
 */

const defaultPrisma = require('../utils/prismaClient');

const DEFAULT_QUOTAS = [
  { scope_type: 'ORGANIZATION', scope_id: 'DEFAULT_ORG_QUOTA', daily_request_limit: 5000, monthly_token_limit: 10000000 },
  { scope_type: 'USER', scope_id: 'DEFAULT_USER_QUOTA', daily_request_limit: 500, monthly_token_limit: 1000000 },
  { scope_type: 'MODULE', scope_id: 'COMPLIANCE_INTELLIGENCE', daily_request_limit: 10000, monthly_token_limit: 20000000 },
];

class QuotaService {
  /**
   * Seed Standard Default Quotas
   */
  static async seedQuotas(client = defaultPrisma) {
    const seeded = [];
    for (const q of DEFAULT_QUOTAS) {
      const quota = await client.aIAdminQuota.upsert({
        where: { scope_type_scope_id: { scope_type: q.scope_type, scope_id: q.scope_id } },
        update: { daily_request_limit: q.daily_request_limit, monthly_token_limit: q.monthly_token_limit },
        create: q,
      });
      seeded.push(quota);
    }
    return seeded;
  }

  /**
   * Set or Update Quota for Scope
   */
  static async setQuota({ scopeType, scopeId, dailyLimit = 1000, monthlyLimit = 1000000, alertThresholdPct = 80 }, client = defaultPrisma) {
    const scopeUpper = scopeType.toUpperCase();
    return await client.aIAdminQuota.upsert({
      where: { scope_type_scope_id: { scope_type: scopeUpper, scope_id: String(scopeId) } },
      update: {
        daily_request_limit: Number(dailyLimit),
        monthly_token_limit: Number(monthlyLimit),
        alert_threshold_pct: Number(alertThresholdPct),
      },
      create: {
        scope_type: scopeUpper,
        scope_id: String(scopeId),
        daily_request_limit: Number(dailyLimit),
        monthly_token_limit: Number(monthlyLimit),
        alert_threshold_pct: Number(alertThresholdPct),
      },
    });
  }

  /**
   * List Quotas
   */
  static async listQuotas(scopeType = null, client = defaultPrisma) {
    await this.seedQuotas(client);

    const where = {};
    if (scopeType && scopeType !== 'ALL') where.scope_type = scopeType.toUpperCase();

    return await client.aIAdminQuota.findMany({
      where,
      orderBy: [{ scope_type: 'asc' }, { scope_id: 'asc' }],
    });
  }
}

module.exports = QuotaService;
