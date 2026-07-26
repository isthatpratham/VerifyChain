/**
 * index.js
 * Central Exporter for Enterprise Monitoring, Analytics & Operational Intelligence (Phase 11.5).
 */

const OperationsAnalyticsFacade = require('./OperationsAnalyticsFacade');
const HealthService = require('./HealthService');
const MetricsService = require('./MetricsService');
const AnalyticsService = require('./AnalyticsService');
const AlertEngine = require('./AlertEngine');
const TrendAnalysisService = require('./TrendAnalysisService');
const KPIService = require('./KPIService');
const ReportingService = require('./ReportingService');
const OperationalInsightsService = require('./OperationalInsightsService');
const ExecutiveSummaryService = require('./ExecutiveSummaryService');
const OperationsDashboardService = require('./OperationsDashboardService');

module.exports = {
  OperationsAnalyticsFacade,
  HealthService,
  MetricsService,
  AnalyticsService,
  AlertEngine,
  TrendAnalysisService,
  KPIService,
  ReportingService,
  OperationalInsightsService,
  ExecutiveSummaryService,
  OperationsDashboardService,
};
