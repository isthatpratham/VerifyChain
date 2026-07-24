/**
 * index.js
 * Master Facade for Developer Platform Bounded Context (Phase 8.5).
 */
const { DEVELOPER_SCOPES, ALL_DEVELOPER_SCOPES, hasDeveloperScope } = require('./domain/DeveloperScopePermissions');
const DeveloperDashboardService = require('./application/DeveloperDashboardService');
const ApiKeyManagementService = require('./application/ApiKeyManagementService');
const WebhookManagementService = require('./application/WebhookManagementService');
const ConnectorManagementService = require('./application/ConnectorManagementService');
const DeveloperAppManagementService = require('./application/DeveloperAppManagementService');
const AnalyticsService = require('./application/AnalyticsService');
const AuditCenterService = require('./application/AuditCenterService');
const SecurityCenterService = require('./application/SecurityCenterService');
const ObservabilityService = require('./application/ObservabilityService');
const GlobalSearchService = require('./application/GlobalSearchService');
const PreferencesService = require('./application/PreferencesService');

module.exports = {
  // Scopes & Domain Rules
  DEVELOPER_SCOPES,
  ALL_DEVELOPER_SCOPES,
  hasDeveloperScope,

  // Application Services
  DeveloperDashboardService,
  ApiKeyManagementService,
  WebhookManagementService,
  ConnectorManagementService,
  DeveloperAppManagementService,
  AnalyticsService,
  AuditCenterService,
  SecurityCenterService,
  ObservabilityService,
  GlobalSearchService,
  PreferencesService,
};
