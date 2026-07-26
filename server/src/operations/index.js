/**
 * index.js
 * Central Exporter for Platform Operations & System Configuration (Phase 11.3).
 */

const OperationsFacade = require('./OperationsFacade');
const PlatformConfigurationService = require('./PlatformConfigurationService');
const FeatureManagementService = require('./FeatureManagementService');
const SystemSettingsService = require('./SystemSettingsService');
const StorageProviderManager = require('./StorageProviderManager');
const IntegrationRegistry = require('./IntegrationRegistry');
const EmailConfigurationService = require('./EmailConfigurationService');
const NotificationConfigurationService = require('./NotificationConfigurationService');
const BrandingManager = require('./BrandingManager');
const OperationalSettingsService = require('./OperationalSettingsService');

module.exports = {
  OperationsFacade,
  PlatformConfigurationService,
  FeatureManagementService,
  SystemSettingsService,
  StorageProviderManager,
  IntegrationRegistry,
  EmailConfigurationService,
  NotificationConfigurationService,
  BrandingManager,
  OperationalSettingsService,
};
