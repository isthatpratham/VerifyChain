/**
 * developerPlatform.routes.js
 * Developer Platform & Integration Management REST API Router (/api/v1/developer-platform).
 */
const express = require('express');
const router = express.Router();
const { sendSuccess, sendError } = require('../../../utils/apiResponse');
const dualAuthMiddleware = require('../../../middleware/dualAuth.middleware');
const { requireScope } = require('../../../middleware/scopeAuth.middleware');

// Dual-auth: accepts JWT (frontend dashboard) or API Key (external consumers)
router.use(dualAuthMiddleware());
const {
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
  DEVELOPER_SCOPES,
} = require('../../../developerPlatform');

/**
 * GET /api/v1/developer-platform/dashboard
 */
router.get('/dashboard', requireScope('developer.read'), async (req, res) => {
  try {
    const msmeId = req.msmeId || req.user?.msmeId || req.query.msmeId;
    const data = await DeveloperDashboardService.getDashboardOverview(msmeId);
    return sendSuccess(res, { statusCode: 200, data });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'DASHBOARD_ERROR', message: 'Failed to fetch dashboard overview.', details: err.message });
  }
});

/**
 * GET /api/v1/developer-platform/analytics
 */
router.get('/analytics', requireScope('developer.read'), async (req, res) => {
  try {
    const msmeId = req.msmeId || req.user?.msmeId || req.query.msmeId || 1;
    const days = parseInt(req.query.days || 7, 10);
    const { search, appId } = req.query;
    const data = await AnalyticsService.getUsageAnalytics(msmeId, days, search, appId);
    return sendSuccess(res, { statusCode: 200, data });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'ANALYTICS_ERROR', message: 'Failed to fetch analytics dataset.', details: err.message });
  }
});

/**
 * Developer Applications Management
 */
router.get('/apps', requireScope('developer.read'), async (req, res) => {
  try {
    const msmeId = req.msmeId || req.user?.msmeId || req.query.msmeId || 1;
    const apps = await DeveloperAppManagementService.listApps(msmeId);
    return sendSuccess(res, { statusCode: 200, data: apps });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'APPS_FETCH_ERROR', message: 'Failed to list developer applications.', details: err.message });
  }
});

router.get('/apps/:id', requireScope('developer.read'), async (req, res) => {
  try {
    const details = await DeveloperAppManagementService.getAppDetails(req.params.id);
    return sendSuccess(res, { statusCode: 200, data: details });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'APP_DETAILS_ERROR', message: 'Failed to fetch application details.', details: err.message });
  }
});

router.post('/apps', requireScope('developer.write'), async (req, res) => {
  try {
    const { name, description, environment } = req.body;
    const msmeId = req.msmeId || req.user?.msmeId || req.body.msmeId || 1;
    if (!name) {
      return sendError(res, { statusCode: 400, errorCode: 'MISSING_FIELD', message: "Field 'name' is required." });
    }
    const app = await DeveloperAppManagementService.registerApp({ msmeId, name, description, environment });
    return sendSuccess(res, { statusCode: 201, data: app });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'APP_REGISTER_ERROR', message: 'Failed to register developer application.', details: err.message });
  }
});

router.put('/apps/:id', requireScope('developer.write'), async (req, res) => {
  try {
    const updated = await DeveloperAppManagementService.updateApp(req.params.id, req.body);
    return sendSuccess(res, { statusCode: 200, data: updated });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'APP_UPDATE_ERROR', message: 'Failed to update developer application.', details: err.message });
  }
});

router.patch('/apps/:id/toggle', requireScope('developer.write'), async (req, res) => {
  try {
    const updated = await DeveloperAppManagementService.toggleActive(req.params.id);
    return sendSuccess(res, { statusCode: 200, data: updated });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'APP_TOGGLE_ERROR', message: 'Failed to toggle application status.', details: err.message });
  }
});

router.post('/apps/:id/apikeys', requireScope('apikey.manage'), async (req, res) => {
  try {
    const { name, environment, scopes, expiresDays } = req.body;
    const result = await DeveloperAppManagementService.assignApiKey(req.params.id, { name, environment, scopes, expiresDays });
    return sendSuccess(res, { statusCode: 201, data: result });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'APP_APIKEY_ASSIGN_ERROR', message: 'Failed to assign API key to application.', details: err.message });
  }
});

router.delete('/apps/:id', requireScope('developer.write'), async (req, res) => {
  try {
    const result = await DeveloperAppManagementService.deleteApp(req.params.id);
    return sendSuccess(res, { statusCode: 200, data: result });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'APP_DELETE_ERROR', message: 'Failed to delete application.', details: err.message });
  }
});

/**
 * API Key Management
 */
router.get('/apikeys', requireScope('apikey.manage'), async (req, res) => {
  try {
    const { developerAppId } = req.query;
    const msmeId = req.msmeId || req.user?.msmeId || 1;
    const keys = await ApiKeyManagementService.listApiKeys({ developerAppId, msmeId });
    return sendSuccess(res, { statusCode: 200, data: keys });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'APIKEYS_FETCH_ERROR', message: 'Failed to list API keys.', details: err.message });
  }
});

router.post('/apikeys', requireScope('apikey.manage'), async (req, res) => {
  try {
    const { developerAppId, name, environment, scopes, expiresDays } = req.body;
    const msmeId = req.msmeId || req.user?.msmeId || req.body.msmeId || 1;
    const result = await ApiKeyManagementService.createApiKey({ developerAppId, msmeId, name, environment, scopes, expiresDays });
    return sendSuccess(res, { statusCode: 201, data: result });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'APIKEY_CREATE_ERROR', message: 'Failed to create API key.', details: err.message });
  }
});

router.patch('/apikeys/:id', requireScope('apikey.manage'), async (req, res) => {
  try {
    const { name, status, scopes, expiresDays } = req.body;
    const updated = await ApiKeyManagementService.updateApiKey(req.params.id, { name, status, scopes, expiresDays });
    return sendSuccess(res, { statusCode: 200, data: updated });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'APIKEY_UPDATE_ERROR', message: 'Failed to update API key.', details: err.message });
  }
});

router.delete('/apikeys/:id', requireScope('apikey.manage'), async (req, res) => {
  try {
    const result = await ApiKeyManagementService.deleteApiKey(req.params.id);
    return sendSuccess(res, { statusCode: 200, data: result });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'APIKEY_DELETE_ERROR', message: 'Failed to delete API key.', details: err.message });
  }
});

router.post('/apikeys/:id/rotate', requireScope('apikey.manage'), async (req, res) => {
  try {
    const result = await ApiKeyManagementService.rotateApiKey(req.params.id);
    return sendSuccess(res, { statusCode: 200, data: result });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'APIKEY_ROTATE_ERROR', message: 'Failed to rotate API key.', details: err.message });
  }
});

router.post('/apikeys/:id/revoke', requireScope('apikey.manage'), async (req, res) => {
  try {
    const { reason } = req.body;
    const revoked = await ApiKeyManagementService.revokeApiKey(req.params.id, reason);
    return sendSuccess(res, { statusCode: 200, data: revoked });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'APIKEY_REVOKE_ERROR', message: 'Failed to revoke API key.', details: err.message });
  }
});

router.get('/apikeys/:id/stats', requireScope('apikey.manage'), async (req, res) => {
  try {
    const stats = await ApiKeyManagementService.getKeyUsageStats(req.params.id);
    return sendSuccess(res, { statusCode: 200, data: stats });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'APIKEY_STATS_ERROR', message: 'Failed to fetch API key usage statistics.', details: err.message });
  }
});

/**
 * Webhook Subscriptions Management
 */
router.get('/webhooks', requireScope('webhook.manage'), async (req, res) => {
  try {
    const { developerAppId } = req.query;
    const msmeId = req.msmeId || req.user?.msmeId || 1;
    const webhooks = await WebhookManagementService.listSubscriptions({ developerAppId, msmeId });
    return sendSuccess(res, { statusCode: 200, data: webhooks });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'WEBHOOKS_FETCH_ERROR', message: 'Failed to list webhook subscriptions.', details: err.message });
  }
});

router.post('/webhooks', requireScope('webhook.manage'), async (req, res) => {
  try {
    const { developerAppId, targetUrl, subscribedEvents } = req.body;
    const msmeId = req.msmeId || req.user?.msmeId || req.body.msmeId || 1;
    if (!targetUrl) {
      return sendError(res, { statusCode: 400, errorCode: 'MISSING_FIELDS', message: "Field 'targetUrl' is required." });
    }
    const result = await WebhookManagementService.createSubscription({ developerAppId, msmeId, targetUrl, subscribedEvents });
    return sendSuccess(res, { statusCode: 201, data: result });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'WEBHOOK_CREATE_ERROR', message: 'Failed to create webhook subscription.', details: err.message });
  }
});

router.patch('/webhooks/:id', requireScope('webhook.manage'), async (req, res) => {
  try {
    const { targetUrl, subscribedEvents, is_active } = req.body;
    const updated = await WebhookManagementService.updateSubscription(req.params.id, { targetUrl, subscribedEvents, is_active });
    return sendSuccess(res, { statusCode: 200, data: updated });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'WEBHOOK_UPDATE_ERROR', message: 'Failed to update webhook subscription.', details: err.message });
  }
});

router.delete('/webhooks/:id', requireScope('webhook.manage'), async (req, res) => {
  try {
    const result = await WebhookManagementService.deleteSubscription(req.params.id);
    return sendSuccess(res, { statusCode: 200, data: result });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'WEBHOOK_DELETE_ERROR', message: 'Failed to delete webhook subscription.', details: err.message });
  }
});

router.patch('/webhooks/:id/toggle', requireScope('webhook.manage'), async (req, res) => {
  try {
    const updated = await WebhookManagementService.toggleStatus(req.params.id);
    return sendSuccess(res, { statusCode: 200, data: updated });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'WEBHOOK_TOGGLE_ERROR', message: 'Failed to toggle webhook status.', details: err.message });
  }
});

router.post('/webhooks/:id/rotate-secret', requireScope('webhook.manage'), async (req, res) => {
  try {
    const result = await WebhookManagementService.rotateSecret(req.params.id);
    return sendSuccess(res, { statusCode: 200, data: result });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'WEBHOOK_ROTATE_ERROR', message: 'Failed to rotate webhook secret.', details: err.message });
  }
});

router.post('/webhooks/:id/test', requireScope('webhook.manage'), async (req, res) => {
  try {
    const result = await WebhookManagementService.sendTestPing(req.params.id);
    return sendSuccess(res, { statusCode: 200, data: result });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'WEBHOOK_TEST_ERROR', message: 'Failed to send test ping.', details: err.message });
  }
});

router.post('/webhooks/deliveries/:id/replay', requireScope('webhook.manage'), async (req, res) => {
  try {
    const result = await WebhookManagementService.replayDelivery(req.params.id);
    return sendSuccess(res, { statusCode: 200, data: result });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'WEBHOOK_REPLAY_ERROR', message: 'Failed to replay webhook delivery.', details: err.message });
  }
});

router.get('/webhooks/:id/logs', requireScope('webhook.manage'), async (req, res) => {
  try {
    const logs = await WebhookManagementService.getDeliveryLogs(req.params.id);
    return sendSuccess(res, { statusCode: 200, data: logs });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'WEBHOOK_LOGS_ERROR', message: 'Failed to fetch webhook logs.', details: err.message });
  }
});

/**
 * Connector Platform Management
 */
router.get('/connectors', requireScope('connector.manage'), async (req, res) => {
  try {
    const msmeId = req.msmeId || req.user?.msmeId || req.query.msmeId || 1;
    const connectors = await ConnectorManagementService.listInstalledConnectors(msmeId);
    return sendSuccess(res, { statusCode: 200, data: connectors });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'CONNECTORS_FETCH_ERROR', message: 'Failed to list installed connectors.', details: err.message });
  }
});

router.post('/connectors/connections', requireScope('connector.manage'), async (req, res) => {
  try {
    const { providerCode, name, environment, credentials, config } = req.body;
    const msmeId = req.msmeId || req.user?.msmeId || req.body.msmeId || 1;
    if (!providerCode) {
      return sendError(res, { statusCode: 400, errorCode: 'MISSING_FIELD', message: "Field 'providerCode' is required." });
    }
    const result = await ConnectorManagementService.connectProvider({ msmeId, providerCode, name, environment, credentials, config });
    return sendSuccess(res, { statusCode: 201, data: result });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'CONNECTOR_CONNECT_ERROR', message: 'Failed to connect provider.', details: err.message });
  }
});

router.patch('/connectors/connections/:id/toggle', requireScope('connector.manage'), async (req, res) => {
  try {
    const updated = await ConnectorManagementService.toggleConnectionStatus(req.params.id);
    return sendSuccess(res, { statusCode: 200, data: updated });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'CONNECTOR_TOGGLE_ERROR', message: 'Failed to toggle connection status.', details: err.message });
  }
});

router.post('/connectors/connections/:id/test', requireScope('connector.manage'), async (req, res) => {
  try {
    const result = await ConnectorManagementService.testHealth(req.params.id);
    return sendSuccess(res, { statusCode: 200, data: result });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'CONNECTOR_TEST_ERROR', message: 'Failed to test connection health.', details: err.message });
  }
});

router.post('/connectors/connections/:id/sync', requireScope('connector.manage'), async (req, res) => {
  try {
    const { syncType } = req.body;
    const result = await ConnectorManagementService.triggerSync(req.params.id, syncType);
    return sendSuccess(res, { statusCode: 200, data: result });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'CONNECTOR_SYNC_ERROR', message: 'Failed to trigger synchronization job.', details: err.message });
  }
});

router.post('/connectors/connections/:id/rotate', requireScope('connector.manage'), async (req, res) => {
  try {
    const { newSecretKey } = req.body;
    const result = await ConnectorManagementService.rotateCredentials(req.params.id, newSecretKey);
    return sendSuccess(res, { statusCode: 200, data: result });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'CONNECTOR_ROTATE_ERROR', message: 'Failed to rotate connector credentials.', details: err.message });
  }
});

router.get('/connectors/connections/:id/logs', requireScope('connector.manage'), async (req, res) => {
  try {
    const logs = await ConnectorManagementService.getConnectionLogs(req.params.id);
    return sendSuccess(res, { statusCode: 200, data: logs });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'CONNECTOR_LOGS_ERROR', message: 'Failed to fetch connection logs.', details: err.message });
  }
});

router.delete('/connectors/connections/:id', requireScope('connector.manage'), async (req, res) => {
  try {
    const result = await ConnectorManagementService.deleteConnection(req.params.id);
    return sendSuccess(res, { statusCode: 200, data: result });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'CONNECTOR_DELETE_ERROR', message: 'Failed to delete connection.', details: err.message });
  }
});

/**
 * Audit Center Management
 */
router.get('/audit', requireScope('audit.read'), async (req, res) => {
  try {
    const { search, action, resourceType, module, severity, status, startDate, endDate, page, limit } = req.query;
    const msmeId = req.msmeId || req.user?.msmeId || req.query.msmeId || 1;
    const result = await AuditCenterService.searchAuditLogs({
      msmeId,
      search,
      action,
      resourceType,
      module,
      severity,
      status,
      startDate,
      endDate,
      page,
      limit,
    });
    return sendSuccess(res, { statusCode: 200, data: result });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'AUDIT_FETCH_ERROR', message: 'Failed to fetch audit logs.', details: err.message });
  }
});

router.get('/audit/export', requireScope('audit.read'), async (req, res) => {
  try {
    const { search, action, resourceType, module, severity, status, startDate, endDate, format } = req.query;
    const msmeId = req.msmeId || req.user?.msmeId || req.query.msmeId || 1;
    const exportResult = await AuditCenterService.exportAuditLogs({
      msmeId,
      search,
      action,
      resourceType,
      module,
      severity,
      status,
      startDate,
      endDate,
      format,
    });

    if (exportResult.format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.filename}"`);
      return res.send(exportResult.content);
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${exportResult.filename}"`);
    return res.send(exportResult.content);
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'AUDIT_EXPORT_ERROR', message: 'Failed to export audit logs.', details: err.message });
  }
});

router.post('/audit/:id/bookmark', requireScope('audit.read'), async (req, res) => {
  try {
    const { note } = req.body;
    const msmeId = req.msmeId || req.user?.msmeId || req.body.msmeId || 1;
    const bookmark = await AuditCenterService.bookmarkAuditLog(msmeId, req.params.id, note);
    return sendSuccess(res, { statusCode: 201, data: bookmark });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'BOOKMARK_ERROR', message: 'Failed to bookmark audit log.', details: err.message });
  }
});

router.delete('/audit/:id/bookmark', requireScope('audit.read'), async (req, res) => {
  try {
    const msmeId = req.msmeId || req.user?.msmeId || req.query.msmeId || 1;
    const deleted = await AuditCenterService.removeBookmark(msmeId, req.params.id);
    return sendSuccess(res, { statusCode: 200, data: deleted });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'BOOKMARK_DELETE_ERROR', message: 'Failed to remove audit bookmark.', details: err.message });
  }
});

/**
 * Security Center Management
 */
router.get('/security', requireScope('developer.read'), async (req, res) => {
  try {
    const msmeId = req.msmeId || req.user?.msmeId || req.query.msmeId;
    const report = await SecurityCenterService.getSecurityReport(msmeId);
    return sendSuccess(res, { statusCode: 200, data: report });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'SECURITY_FETCH_ERROR', message: 'Failed to fetch security report.', details: err.message });
  }
});

router.post('/security/alerts/:id/resolve', requireScope('developer.write'), async (req, res) => {
  try {
    const msmeId = req.msmeId || req.user?.msmeId || req.body.msmeId;
    const resolved = await SecurityCenterService.resolveAlert(msmeId, req.params.id);
    return sendSuccess(res, { statusCode: 200, data: resolved });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'ALERT_RESOLVE_ERROR', message: 'Failed to resolve security alert.', details: err.message });
  }
});

/**
 * System Observability
 */
router.get('/observability', requireScope('developer.read'), async (req, res) => {
  try {
    const obs = await ObservabilityService.getSystemObservability();
    return sendSuccess(res, { statusCode: 200, data: obs });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'OBSERVABILITY_ERROR', message: 'Failed to fetch observability metrics.', details: err.message });
  }
});

/**
 * Universal Global Search
 */
router.get('/search', requireScope('developer.read'), async (req, res) => {
  try {
    const { q } = req.query;
    const msmeId = req.msmeId || req.user?.msmeId || req.query.msmeId;
    const searchResults = await GlobalSearchService.universalSearch(msmeId, q);
    return sendSuccess(res, { statusCode: 200, data: searchResults });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'SEARCH_ERROR', message: 'Failed to execute global search.', details: err.message });
  }
});

/**
 * Preferences & Saved Filters
 */
router.get('/preferences', requireScope('developer.read'), async (req, res) => {
  try {
    const msmeId = req.msmeId || req.user?.msmeId || req.query.msmeId;
    const dashPref = await PreferencesService.getDashboardPreferences(msmeId);
    const notifPref = await PreferencesService.getNotificationPreferences(msmeId);
    return sendSuccess(res, { statusCode: 200, data: { dashboard: dashPref, notifications: notifPref } });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'PREFERENCES_FETCH_ERROR', message: 'Failed to fetch preferences.', details: err.message });
  }
});

router.put('/preferences/dashboard', requireScope('developer.write'), async (req, res) => {
  try {
    const { theme, default_view, widget_config_json } = req.body;
    const msmeId = req.msmeId || req.user?.msmeId || req.body.msmeId;
    const updated = await PreferencesService.updateDashboardPreferences(msmeId, { theme, default_view, widget_config_json });
    return sendSuccess(res, { statusCode: 200, data: updated });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'PREF_UPDATE_ERROR', message: 'Failed to update dashboard preferences.', details: err.message });
  }
});

router.put('/preferences/notifications', requireScope('developer.write'), async (req, res) => {
  try {
    const { email_alerts, security_alerts, webhook_failures_alert } = req.body;
    const msmeId = req.msmeId || req.user?.msmeId || req.body.msmeId;
    const updated = await PreferencesService.updateNotificationPreferences(msmeId, { email_alerts, security_alerts, webhook_failures_alert });
    return sendSuccess(res, { statusCode: 200, data: updated });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'PREF_UPDATE_ERROR', message: 'Failed to update notification preferences.', details: err.message });
  }
});

router.get('/filters', requireScope('developer.read'), async (req, res) => {
  try {
    const { category } = req.query;
    const msmeId = req.msmeId || req.user?.msmeId || req.query.msmeId;
    const filters = await PreferencesService.getSavedFilters(msmeId, category);
    return sendSuccess(res, { statusCode: 200, data: filters });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'FILTERS_FETCH_ERROR', message: 'Failed to fetch saved filters.', details: err.message });
  }
});

router.post('/filters', requireScope('developer.write'), async (req, res) => {
  try {
    const { name, category, filterJson } = req.body;
    const msmeId = req.msmeId || req.user?.msmeId || req.body.msmeId;
    const filter = await PreferencesService.saveFilter(msmeId, name, category, filterJson);
    return sendSuccess(res, { statusCode: 201, data: filter });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'FILTER_SAVE_ERROR', message: 'Failed to save filter.', details: err.message });
  }
});

router.delete('/filters/:id', requireScope('developer.write'), async (req, res) => {
  try {
    const deleted = await PreferencesService.deleteFilter(req.params.id);
    return sendSuccess(res, { statusCode: 200, data: deleted });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'FILTER_DELETE_ERROR', message: 'Failed to delete saved filter.', details: err.message });
  }
});

module.exports = router;
