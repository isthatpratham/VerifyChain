/**
 * SystemSettingsService.js
 * Core System Parameters, Maintenance Mode & System Banners (Phase 11.3).
 */

const defaultPrisma = require('../utils/prismaClient');
const PlatformConfigurationService = require('./PlatformConfigurationService');

class SystemSettingsService {
  /**
   * Get Consolidated System Parameters & Settings
   */
  static async getSystemOverview(client = defaultPrisma) {
    const settings = await PlatformConfigurationService.listSettings(null, client);
    const settingsMap = new Map(settings.map(s => [s.key, s.value_json]));

    return {
      platformName: settingsMap.get('platform.name') || 'VerifyChain Enterprise Platform',
      timezone: settingsMap.get('platform.timezone') || 'Asia/Kolkata',
      language: settingsMap.get('platform.language') || 'en',
      currency: settingsMap.get('platform.currency') || 'INR',
      maintenanceMode: Boolean(settingsMap.get('system.maintenance_mode')),
      announcementBanner: settingsMap.get('system.announcement_banner') || '',
      sessionTimeoutMins: Number(settingsMap.get('security.session_timeout_mins') || 60),
      maxUploadSizeMb: Number(settingsMap.get('storage.max_upload_size_mb') || 100),
      maxOrgQuotaMb: Number(settingsMap.get('storage.max_org_quota_mb') || 50000),
    };
  }

  /**
   * Toggle Maintenance Mode State
   */
  static async setMaintenanceMode(enabled, reason = 'Scheduled maintenance window', updatedBy = 'ADMIN', client = defaultPrisma) {
    return await PlatformConfigurationService.updateSetting({
      key: 'system.maintenance_mode',
      value: Boolean(enabled),
      category: 'SYSTEM',
      updatedBy,
      reason,
    }, client);
  }
}

module.exports = SystemSettingsService;
