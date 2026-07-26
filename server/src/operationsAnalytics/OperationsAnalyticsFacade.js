/**
 * OperationsAnalyticsFacade.js
 * Unified Operations Center & Operational Intelligence Facade (Phase 11.5).
 */

const HealthService = require('./HealthService');
const MetricsService = require('./MetricsService');
const AnalyticsService = require('./AnalyticsService');
const AlertEngine = require('./AlertEngine');
const TrendAnalysisService = require('./TrendAnalysisService');
const KPIService = require('./KPIService');
const ReportingService = require('./ReportingService');
const OperationsDashboardService = require('./OperationsDashboardService');

class OperationsAnalyticsFacade {
  // Dashboard & Health
  static async getDashboardPayload() { return await OperationsDashboardService.getDashboardPayload(); }
  static async getPlatformHealth() { return await HealthService.getPlatformHealth(); }
  static async updateModuleHealth(params) { return await HealthService.updateModuleHealth(params); }

  // Metrics & Analytics
  static async getBusinessMetrics() { return await MetricsService.getBusinessMetrics(); }
  static async getUserAnalytics() { return await AnalyticsService.getUserAnalytics(); }
  static async getDocumentAnalytics() { return await AnalyticsService.getDocumentAnalytics(); }
  static async getComplianceAnalytics() { return await AnalyticsService.getComplianceAnalytics(); }
  static async getAIAnalytics() { return await AnalyticsService.getAIAnalytics(); }
  static async getSecurityAnalytics() { return await AnalyticsService.getSecurityAnalytics(); }

  // Alerts & Trends
  static async listAlerts(status, severity) { return await AlertEngine.listAlerts(status, severity); }
  static async raiseAlert(params) { return await AlertEngine.raiseAlert(params); }
  static async updateAlertState(alertId, params) { return await AlertEngine.updateAlertState(alertId, params); }
  static async getTrends(periodType) { return await TrendAnalysisService.getTrends(periodType); }

  // KPIs & Reports
  static async listKPIs(category) { return await KPIService.listKPIs(category); }
  static async listReports(reportType) { return await ReportingService.listReports(reportType); }
  static async generateReport(params) { return await ReportingService.generateReport(params); }
}

module.exports = OperationsAnalyticsFacade;
