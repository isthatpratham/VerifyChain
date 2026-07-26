/**
 * operations.routes.js
 * REST API Endpoint Router for Platform Operations Center (Phase 11.3).
 */

const express = require('express');
const router = express.Router();
const OperationsFacade = require('../../../operations/OperationsFacade');
const { sendSuccess, sendError } = require('../../../utils/apiResponse');

// 1. Operations Dashboard Stats & Overview
router.get('/dashboard/stats', async (req, res) => {
  try {
    const stats = await OperationsFacade.getOperationsDashboardStats();
    return sendSuccess(res, stats, 'Platform Operations Dashboard metrics fetched.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

// 2. Global Platform Settings & System Maintenance
router.get('/settings', async (req, res) => {
  try {
    const settings = await OperationsFacade.listSettings(req.query.category);
    return sendSuccess(res, settings, 'Platform settings listed.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

router.post('/settings', async (req, res) => {
  try {
    const setting = await OperationsFacade.updateSetting({
      ...req.body,
      updatedBy: req.user?.id ? `USER_${req.user.id}` : 'ADMIN',
    });
    return sendSuccess(res, setting, 'Platform setting updated & snapshot created.');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

router.post('/maintenance-mode', async (req, res) => {
  try {
    const result = await OperationsFacade.setMaintenanceMode(
      req.body.enabled,
      req.body.reason,
      req.user?.id ? `USER_${req.user.id}` : 'ADMIN'
    );
    return sendSuccess(res, result, `Maintenance mode set to ${req.body.enabled ? 'ENABLED' : 'DISABLED'}.`);
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

// 3. Feature Flags Management
router.get('/features', async (req, res) => {
  try {
    const flags = await OperationsFacade.listFeatureFlags(req.query.category);
    return sendSuccess(res, flags, 'Feature flags listed.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

router.post('/features', async (req, res) => {
  try {
    const flag = await OperationsFacade.updateFeatureFlag({
      ...req.body,
      updatedBy: req.user?.id ? `USER_${req.user.id}` : 'ADMIN',
    });
    return sendSuccess(res, flag, 'Feature flag updated.');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

router.get('/features/evaluate/:key', async (req, res) => {
  try {
    const isEnabled = await OperationsFacade.isFeatureEnabled(req.params.key);
    return sendSuccess(res, { key: req.params.key, isEnabled }, 'Feature flag evaluated.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

// 4. Integration Registry & Health Checks
router.get('/integrations', async (req, res) => {
  try {
    const integrations = await OperationsFacade.listIntegrations(req.query.category);
    return sendSuccess(res, integrations, 'Integration registry listed.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

router.post('/integrations/health-check', async (req, res) => {
  try {
    const results = await OperationsFacade.runHealthChecks();
    return sendSuccess(res, results, 'Integration health checks executed.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

// 5. Storage & Email Providers Configuration
router.get('/storage', async (req, res) => {
  try {
    const providers = await OperationsFacade.listStorageProviders();
    return sendSuccess(res, providers, 'Storage providers listed.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

router.post('/storage', async (req, res) => {
  try {
    const active = await OperationsFacade.setStorageProvider({
      ...req.body,
      updatedBy: req.user?.id ? `USER_${req.user.id}` : 'ADMIN',
    });
    return sendSuccess(res, active, 'Storage provider activated & configured.');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

router.get('/email', async (req, res) => {
  try {
    const providers = await OperationsFacade.listEmailProviders();
    return sendSuccess(res, providers, 'Email providers listed.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

router.post('/email', async (req, res) => {
  try {
    const active = await OperationsFacade.configureEmailProvider(req.body);
    return sendSuccess(res, active, 'Email provider configured.');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

// 6. Notification Channels & Branding
router.get('/notifications/channels', async (req, res) => {
  try {
    const channels = await OperationsFacade.listNotificationChannels();
    return sendSuccess(res, channels, 'Notification channels listed.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

router.post('/notifications/channels', async (req, res) => {
  try {
    const updated = await OperationsFacade.toggleNotificationChannel(req.body.channelType, req.body.isEnabled);
    return sendSuccess(res, updated, 'Notification channel updated.');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

router.get('/branding', async (req, res) => {
  try {
    const branding = await OperationsFacade.getBranding();
    return sendSuccess(res, branding, 'Platform branding fetched.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

router.put('/branding', async (req, res) => {
  try {
    const branding = await OperationsFacade.updateBranding(req.body);
    return sendSuccess(res, branding, 'Platform branding updated.');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

// 7. System Announcements, Snapshots & Rollback
router.get('/announcements', async (req, res) => {
  try {
    const announcements = await OperationsFacade.listAnnouncements();
    return sendSuccess(res, announcements, 'System announcements listed.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

router.post('/announcements', async (req, res) => {
  try {
    const announcement = await OperationsFacade.publishAnnouncement(req.body);
    return sendSuccess(res, announcement, 'System announcement published.', 201);
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

router.get('/history', async (req, res) => {
  try {
    const snapshots = await OperationsFacade.listSnapshots(req.query.limit);
    return sendSuccess(res, snapshots, 'Configuration history snapshots listed.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

router.post('/rollback', async (req, res) => {
  try {
    const result = await OperationsFacade.rollbackToVersion(
      req.body.version,
      req.user?.id ? `USER_${req.user.id}` : 'ADMIN'
    );
    return sendSuccess(res, result, 'Configuration rollback executed.');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

module.exports = router;
