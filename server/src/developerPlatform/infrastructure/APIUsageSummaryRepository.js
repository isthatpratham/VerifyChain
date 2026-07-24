/**
 * APIUsageSummaryRepository.js
 * Persistence repository for APIUsageSummaries.
 */
const defaultPrisma = require('../../utils/prismaClient');

class APIUsageSummaryRepository {
  async recordDailySummary(data) {
    return defaultPrisma.aPIUsageSummary.create({ data });
  }

  async getRecentSummaries(developerAppId, days = 30) {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    return defaultPrisma.aPIUsageSummary.findMany({
      where: {
        developer_app_id: parseInt(developerAppId, 10),
        date: { gte: sinceDate },
      },
      orderBy: { date: 'asc' },
    });
  }
}

module.exports = new APIUsageSummaryRepository();
