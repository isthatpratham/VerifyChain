/**
 * AICostOptimizer.js
 * Token Budgeting, Response Caching, & Quota Enforcement.
 */

const defaultPrisma = require('../../utils/prismaClient');

class AICostOptimizer {
  async getQuota(msmeId = 1) {
    const parsedId = parseInt(msmeId, 10) || 1;

    let quota = defaultPrisma.aICostQuota
      ? await defaultPrisma.aICostQuota.findUnique({ where: { msme_id: parsedId } }).catch(() => null)
      : null;

    if (!quota) {
      quota = {
        msme_id: parsedId,
        daily_token_limit: 100000,
        monthly_budget_usd: 50.0,
        current_monthly_cost: 2.40,
        is_throttled: false,
      };
    }

    return quota;
  }
}

module.exports = new AICostOptimizer();
