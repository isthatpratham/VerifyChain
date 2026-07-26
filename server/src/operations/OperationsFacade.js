/**
 * OperationsFacade.js
 * Centralized Operations Facade for Platform Operations Center (Phase 11.3).
 */

const PlatformConfigurationService = require('./PlatformConfigurationService');
const FeatureManagementService = require('./FeatureManagementService');
const SystemSettingsService = require('./SystemSettingsService');
const StorageProviderManager = require('./StorageProviderManager');
const IntegrationRegistry = require('./IntegrationRegistry');
const EmailConfigurationService = require('./EmailConfigurationService');
const NotificationConfigurationService = require('./NotificationConfigurationService');
const BrandingManager = require('./BrandingManager');
const OperationalSettingsService = require('./OperationalSettingsService');
const defaultPrisma = require('../utils/prismaClient');

class OperationsFacade {
  // ─── PLATFORM SETTINGS & CONFIGURATION ──────────────────────────────────
  static async seedDefaultSettings() { return await PlatformConfigurationService.seedDefaultSettings(); }
  static async getSetting(key, defaultValue) { return await PlatformConfigurationService.getSetting(key, defaultValue); }
  static async updateSetting(params) { return await PlatformConfigurationService.updateSetting(params); }
  static async listSettings(category) { return await PlatformConfigurationService.listSettings(category); }
  static async getSystemOverview() { return await SystemSettingsService.getSystemOverview(); }
  static async setMaintenanceMode(enabled, reason, updatedBy) { return await SystemSettingsService.setMaintenanceMode(enabled, reason, updatedBy); }

  // ─── FEATURE FLAGS ───────────────────────────────────────────────────────
  static async isFeatureEnabled(key, defaultValue) { return await FeatureManagementService.isEnabled(key, defaultValue); }
  static async updateFeatureFlag(params) { return await FeatureManagementService.updateFeatureFlag(params); }
  static async listFeatureFlags(category) { return await FeatureManagementService.listFeatureFlags(category); }

  // ─── STORAGE & EMAIL PROVIDERS ───────────────────────────────────────────
  static async setStorageProvider(params) { return await StorageProviderManager.setStorageProvider(params); }
  static async listStorageProviders() { return await StorageProviderManager.listProviders(); }
  static async configureEmailProvider(params) { return await EmailConfigurationService.configureEmailProvider(params); }
  static async listEmailProviders() { return await EmailConfigurationService.listEmailProviders(); }

  // ─── INTEGRATION REGISTRY & HEALTH ──────────────────────────────────────
  static async listIntegrations(category) { return await IntegrationRegistry.listIntegrations(category); }
  static async runHealthChecks() { return await IntegrationRegistry.runHealthChecks(); }

  // ─── NOTIFICATION CHANNELS & BRANDING ─────────────────────────────────────
  static async listNotificationChannels() { return await NotificationConfigurationService.listChannels(); }
  static async toggleNotificationChannel(type, enabled) { return await NotificationConfigurationService.toggleChannel(type, enabled); }
  static async getBranding() { return await BrandingManager.getBranding(); }
  static async updateBranding(params) { return await BrandingManager.updateBranding(params); }

  // ─── ANNOUNCEMENTS, HISTORY & ROLLBACK ────────────────────────────────────
  static async publishAnnouncement(params) { return await OperationalSettingsService.publishAnnouncement(params); }
  static async listAnnouncements() { return await OperationalSettingsService.listAnnouncements(); }
  static async listSnapshots(limit) { return await OperationalSettingsService.listSnapshots(limit); }
  static async rollbackToVersion(version, rollbackBy) { return await OperationalSettingsService.rollbackToVersion(version, rollbackBy); }

  static async getOperationsDashboardStats(client = defaultPrisma) {
    const [settingsCount, flagsCount, integrCount, activeStorage, activeEmail, snapshotsCount] = await Promise.all([
      client.platformSetting.count(),
      client.featureFlag.count(),
      client.integrationProvider.count(),
      client.storageProviderConfig.findFirst({ where: { is_active: true } }),
      client.emailProviderConfig.findFirst({ where: { is_active: true } }),
      client.configurationSnapshot.count(),
    ]);

    const overview = await SystemSettingsService.getSystemOverview(client);

    return {
      settingsCount,
      flagsCount,
      integrCount,
      activeStorageProvider: activeStorage ? activeStorage.provider_type : 'LOCAL',
      activeEmailProvider: activeEmail ? activeEmail.provider_type : 'SMTP',
      snapshotsCount,
      maintenanceMode: overview.maintenanceMode,
      systemOverview: overview,
    };
  }
}

module.exports = OperationsFacade;
