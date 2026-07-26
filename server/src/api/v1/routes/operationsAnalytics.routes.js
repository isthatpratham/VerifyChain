/**
 * operationsAnalytics.routes.js
 * REST API Endpoint Router for Enterprise Operations Center & Analytics (Phase 11.5).
 */

const express = require('express');
const router = express.Router();
const OperationsAnalyticsFacade = require('../../../operationsAnalytics/OperationsAnalyticsFacade');
const { sendSuccess, sendError } = require('../../../utils/apiResponse');

// 1. Dashboard Operations Center Aggregate Payload
router.get('/dashboard', async (req, res) => {
  try {
    const dashboard = await OperationsAnalyticsFacade.getDashboardPayload();
    return sendSuccess(res, dashboard, 'Operations Center dashboard payload fetched.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

// 2. Platform Health
router.get('/health', async (req, res) => {
  try {
    const health = await OperationsAnalyticsFacade.getPlatformHealth();
    return sendSuccess(res, health, 'Platform health diagnostics fetched.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

router.post('/health/check', async (req, res) => {
  try {
    const health = await OperationsAnalyticsFacade.getPlatformHealth();
    return sendSuccess(res, health, 'Real-time health check completed.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

router.put('/health/:moduleKey', async (req, res) => {
  try {
    const updated = await OperationsAnalyticsFacade.updateModuleHealth({
      moduleKey: req.params.moduleKey,
      ...req.body,
    });
    return sendSuccess(res, updated, 'Module health state updated.');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

// 3. Business & Operational Metrics
router.get('/metrics', async (req, res) => {
  try {
    const metrics = await OperationsAnalyticsFacade.getBusinessMetrics();
    return sendSuccess(res, metrics, 'Business & operational metrics fetched.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

// 4. Domain Analytics
router.get('/analytics/users', async (req, res) => {
  try {
    const analytics = await OperationsAnalyticsFacade.getUserAnalytics();
    return sendSuccess(res, analytics, 'User analytics fetched.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

router.get('/analytics/documents', async (req, res) => {
  try {
    const analytics = await OperationsAnalyticsFacade.getDocumentAnalytics();
    return sendSuccess(res, analytics, 'Document analytics fetched.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

router.get('/analytics/compliance', async (req, res) => {
  try {
    const analytics = await OperationsAnalyticsFacade.getComplianceAnalytics();
    return sendSuccess(res, analytics, 'Compliance analytics fetched.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

router.get('/analytics/ai', async (req, res) => {
  try {
    const analytics = await OperationsAnalyticsFacade.getAIAnalytics();
    return sendSuccess(res, analytics, 'AI analytics fetched.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

router.get('/analytics/security', async (req, res) => {
  try {
    const analytics = await OperationsAnalyticsFacade.getSecurityAnalytics();
    return sendSuccess(res, analytics, 'Security analytics fetched.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

// 5. Operational Alerts & Trends
router.get('/alerts', async (req, res) => {
  try {
    const alerts = await OperationsAnalyticsFacade.listAlerts(req.query.status, req.query.severity);
    return sendSuccess(res, alerts, 'Operational alerts listed.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

router.post('/alerts', async (req, res) => {
  try {
    const alert = await OperationsAnalyticsFacade.raiseAlert(req.body);
    return sendSuccess(res, alert, 'Operational alert raised.', 201);
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

router.put('/alerts/:id', async (req, res) => {
  try {
    const alert = await OperationsAnalyticsFacade.updateAlertState(req.params.id, req.body);
    return sendSuccess(res, alert, 'Operational alert updated.');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

router.get('/trends', async (req, res) => {
  try {
    const trends = await OperationsAnalyticsFacade.getTrends(req.query.periodType);
    return sendSuccess(res, trends, 'Trend analysis snapshots fetched.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

// 6. KPIs & Executive Reports
router.get('/kpis', async (req, res) => {
  try {
    const kpis = await OperationsAnalyticsFacade.listKPIs(req.query.category);
    return sendSuccess(res, kpis, 'KPI widget configurations listed.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

router.get('/reports', async (req, res) => {
  try {
    const reports = await OperationsAnalyticsFacade.listReports(req.query.reportType);
    return sendSuccess(res, reports, 'Executive reports catalog listed.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

router.post('/reports/generate', async (req, res) => {
  try {
    const report = await OperationsAnalyticsFacade.generateReport({
      ...req.body,
      createdBy: req.user?.id ? `USER_${req.user.id}` : 'ADMIN',
    });
    return sendSuccess(res, report, 'Executive report generated.', 201);
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

module.exports = router;
