/**
 * DashboardPreferenceRepository.js
 * Persistence repository for DashboardPreferences.
 */
const defaultPrisma = require('../../utils/prismaClient');

class DashboardPreferenceRepository {
  async getByMsme(msmeId) {
    const pref = await defaultPrisma.dashboardPreference.findUnique({
      where: { msme_id: parseInt(msmeId, 10) },
    });
    if (!pref) {
      return defaultPrisma.dashboardPreference.create({
        data: { msme_id: parseInt(msmeId, 10), theme: 'LIGHT', default_view: 'OVERVIEW' },
      });
    }
    return pref;
  }

  async updateByMsme(msmeId, data) {
    return defaultPrisma.dashboardPreference.upsert({
      where: { msme_id: parseInt(msmeId, 10) },
      update: data,
      create: { msme_id: parseInt(msmeId, 10), ...data },
    });
  }
}

module.exports = new DashboardPreferenceRepository();
