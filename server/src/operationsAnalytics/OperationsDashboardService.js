/**
 * OperationsDashboardService.js
 * Central Aggregator for Executive Operations Center Workspace (Phase 11.5).
 */

const HealthService = require('./HealthService');
const MetricsService = require('./MetricsService');
const AnalyticsService = require('./AnalyticsService');
const AlertEngine = require('./AlertEngine');
const TrendAnalysisService = require('./TrendAnalysisService');
const KPIService = require('./KPIService');
const OperationalInsightsService = require('./OperationalInsightsService');
const ExecutiveSummaryService = require('./ExecutiveSummaryService');

class OperationsDashboardService {
  /**
   * Aggregate Operations Center Executive Dashboard Payload
   */
  static async getDashboardPayload(client) {
    const [
      health,
      metrics,
      userAnalytics,
      docAnalytics,
      complianceAnalytics,
      aiAnalytics,
      securityAnalytics,
      alerts,
      trends,
      kpis,
      insights,
      summary,
    ] = await Promise.all([
      HealthService.getPlatformHealth(client),
      MetricsService.getBusinessMetrics(client),
      AnalyticsService.getUserAnalytics(client),
      AnalyticsService.getDocumentAnalytics(client),
      AnalyticsService.getComplianceAnalytics(client),
      AnalyticsService.getAIAnalytics(client),
      AnalyticsService.getSecurityAnalytics(client),
      AlertEngine.listAlerts('ALL', 'ALL', client),
      TrendAnalysisService.getTrends('MONTHLY', client),
      KPIService.listKPIs(null, client),
      OperationalInsightsService.extractInsights(),
      ExecutiveSummaryService.getExecutiveSummary(),
    ]);

    return {
      summary,
      health,
      metrics,
      analytics: {
        users: userAnalytics,
        documents: docAnalytics,
        compliance: complianceAnalytics,
        ai: aiAnalytics,
        security: securityAnalytics,
      },
      alerts,
      trends,
      kpis,
      insights,
    };
  }
}

module.exports = OperationsDashboardService;
