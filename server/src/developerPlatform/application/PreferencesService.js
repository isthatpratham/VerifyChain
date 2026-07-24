/**
 * PreferencesService.js
 * Developer Preferences & Saved Filters Service.
 */
const defaultPrisma = require('../../utils/prismaClient');
const DashboardPreferenceRepository = require('../infrastructure/DashboardPreferenceRepository');
const SavedFilterRepository = require('../infrastructure/SavedFilterRepository');

class PreferencesService {
  async getDashboardPreferences(msmeId = 1) {
    return DashboardPreferenceRepository.getByMsme(msmeId);
  }

  async updateDashboardPreferences(msmeId = 1, data) {
    return DashboardPreferenceRepository.updateByMsme(msmeId, data);
  }

  async getSavedFilters(msmeId = 1, category = null) {
    return SavedFilterRepository.findByMsme(msmeId, category);
  }

  async saveFilter(msmeId = 1, name, category, filterJson) {
    return SavedFilterRepository.create({
      msme_id: parseInt(msmeId, 10),
      name,
      category,
      filter_json: filterJson,
    });
  }

  async deleteFilter(id) {
    return SavedFilterRepository.delete(id);
  }

  async getNotificationPreferences(msmeId = 1) {
    const parsedMsmeId = parseInt(msmeId, 10);
    const pref = await defaultPrisma.notificationPreference.findUnique({
      where: { msme_id: parsedMsmeId },
    });
    if (!pref) {
      return defaultPrisma.notificationPreference.create({
        data: { msme_id: parsedMsmeId, email_alerts: true, security_alerts: true, webhook_failures_alert: true },
      });
    }
    return pref;
  }

  async updateNotificationPreferences(msmeId = 1, data) {
    const parsedMsmeId = parseInt(msmeId, 10);
    return defaultPrisma.notificationPreference.upsert({
      where: { msme_id: parsedMsmeId },
      update: data,
      create: { msme_id: parsedMsmeId, ...data },
    });
  }
}

module.exports = new PreferencesService();
