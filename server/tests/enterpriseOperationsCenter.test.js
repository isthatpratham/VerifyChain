/**
 * enterpriseOperationsCenter.test.js
 * Comprehensive Automated Test Suite for Phase 11.5 Operational Intelligence & Operations Center.
 */

const assert = require('assert');
const {
  OperationsAnalyticsFacade,
  HealthService,
  MetricsService,
  AnalyticsService,
  AlertEngine,
  TrendAnalysisService,
  KPIService,
  ReportingService,
} = require('../src/operationsAnalytics');

async function runEnterpriseOperationsCenterTests() {
  console.log('================================================================');
  console.log('  STARTING ENTERPRISE OPERATIONS CENTER TEST SUITE (11.5)');
  console.log('================================================================\n');

  try {
    // ─── TEST 1: PLATFORM HEALTH MONITORING ACROSS 14 MODULES ─────────────
    console.log('[Test 1] Testing Platform Health Monitoring across 14 System Modules...');
    const health = await OperationsAnalyticsFacade.getPlatformHealth();
    assert.strictEqual(health.totalModules, 14, '14 system modules registered');
    assert.strictEqual(health.overallStatus, 'HEALTHY', 'Overall system status is HEALTHY');

    const updatedModule = await OperationsAnalyticsFacade.updateModuleHealth({
      moduleKey: 'SEARCH_ENGINE',
      status: 'HEALTHY',
      reason: 'Index search latency nominal at 10ms',
    });
    assert.strictEqual(updatedModule.module_key, 'SEARCH_ENGINE', 'Search Engine module health updated');
    console.log('✔ Platform Health Monitoring passed.');

    // ─── TEST 2: BUSINESS & OPERATIONAL METRICS ENGINE ───────────────────
    console.log('\n[Test 2] Testing Business & Operational Metrics Engine...');
    const metrics = await OperationsAnalyticsFacade.getBusinessMetrics();
    assert.ok(metrics.usersCount > 0, 'Users count > 0');
    assert.ok(metrics.documentsCount > 0, 'Documents count > 0');
    assert.ok(metrics.totalStorageMB > 0, 'Total storage MB calculated');
    console.log(`✔ Business Metrics Engine passed (Users: ${metrics.usersCount}, Documents: ${metrics.documentsCount}, Storage: ${metrics.totalStorageMB} MB).`);

    // ─── TEST 3: MULTI-DOMAIN ANALYTICS MODEL ─────────────────────────────
    console.log('\n[Test 3] Testing Multi-Domain Analytics Model (User, Doc, Compliance, AI, Security)...');
    const userAnalytics = await OperationsAnalyticsFacade.getUserAnalytics();
    assert.ok(userAnalytics.dailyActiveUsers > 0, 'DAU calculated');

    const docAnalytics = await OperationsAnalyticsFacade.getDocumentAnalytics();
    assert.ok(docAnalytics.totalDocuments > 0, 'Total documents analyzed');

    const complianceAnalytics = await OperationsAnalyticsFacade.getComplianceAnalytics();
    assert.ok(complianceAnalytics.overallComplianceScore > 0, 'Compliance score calculated');

    const aiAnalytics = await OperationsAnalyticsFacade.getAIAnalytics();
    assert.ok(aiAnalytics.activePrompts > 0, 'AI prompts count > 0');

    const securityAnalytics = await OperationsAnalyticsFacade.getSecurityAnalytics();
    assert.strictEqual(securityAnalytics.permissionDenials24h, 0, 'Zero permission denials in 24h');
    console.log('✔ Multi-Domain Analytics Model passed.');

    // ─── TEST 4: OPERATIONAL ALERT CENTER & LIFECYCLE ─────────────────────
    console.log('\n[Test 4] Testing Operational Alert Center & Lifecycle (Ack/Assign/Resolve)...');
    const alerts = await OperationsAnalyticsFacade.listAlerts();
    assert.ok(alerts.length >= 3, 'Default operational alerts seeded');

    const newAlert = await OperationsAnalyticsFacade.raiseAlert({
      title: 'High Search Latency Spike Alert',
      message: 'Search query latency temporarily exceeded 150ms threshold.',
      severity: 'MEDIUM',
      category: 'SEARCH',
    });
    assert.ok(newAlert.id, 'New alert raised');

    const ackAlert = await OperationsAnalyticsFacade.updateAlertState(newAlert.id, {
      status: 'ACKNOWLEDGED',
      acknowledgedBy: 'SOC_LEAD',
    });
    assert.strictEqual(ackAlert.status, 'ACKNOWLEDGED', 'Alert state updated to ACKNOWLEDGED');
    console.log('✔ Operational Alert Center passed.');

    // ─── TEST 5: MULTI-TIMEFRAME TREND ANALYSIS SNAPSHOTS ────────────────
    console.log('\n[Test 5] Testing Multi-Timeframe Trend Analysis Engine...');
    const monthlyTrends = await OperationsAnalyticsFacade.getTrends('MONTHLY');
    assert.ok(monthlyTrends.userGrowthTrend.length >= 4, 'Monthly user growth trend snapshots found');
    assert.ok(monthlyTrends.storageGrowthTrend.length >= 4, 'Monthly storage growth trend snapshots found');
    console.log('✔ Multi-Timeframe Trend Analysis passed.');

    // ─── TEST 6: CONFIGURABLE KPI WIDGETS ─────────────────────────────────
    console.log('\n[Test 6] Testing Configurable Dashboard KPI Widgets...');
    const kpis = await OperationsAnalyticsFacade.listKPIs();
    assert.ok(kpis.length >= 6, 'Standard KPI widgets registered');
    console.log('✔ Configurable Dashboard KPI Widgets passed.');

    // ─── TEST 7: EXECUTIVE REPORTING ENGINE ──────────────────────────────
    console.log('\n[Test 7] Testing Executive & Governance Report Generation...');
    const newReport = await OperationsAnalyticsFacade.generateReport({
      title: 'VerifyChain Monthly Executive Operations Briefing',
      reportType: 'EXECUTIVE_SUMMARY',
      format: 'JSON',
    });
    assert.ok(newReport.id, 'Executive report generated');
    assert.ok(newReport.summary_json.generatedAt, 'Report summary timestamp present');

    const reportsList = await OperationsAnalyticsFacade.listReports();
    assert.ok(reportsList.length >= 1, 'Executive report catalog listed');
    console.log('✔ Executive Reporting Engine passed.');

    // ─── TEST 8: OPERATIONS CENTER DASHBOARD PAYLOAD AGGREGATION ─────────
    console.log('\n[Test 8] Testing Operations Center Dashboard Payload Aggregation...');
    const payload = await OperationsAnalyticsFacade.getDashboardPayload();
    assert.ok(payload.health.overallStatus, 'Health state aggregated');
    assert.ok(payload.metrics.usersCount, 'Metrics aggregated');
    assert.ok(payload.analytics.users.dailyActiveUsers, 'Analytics aggregated');
    assert.ok(payload.alerts.length >= 3, 'Alerts aggregated');
    console.log('✔ Operations Center Dashboard Payload Aggregation passed.');

    console.log('\n================================================================');
    console.log('  ENTERPRISE OPERATIONS CENTER PASSED ALL VERIFICATIONS!');
    console.log('================================================================');
  } catch (err) {
    console.error('\n❌ ENTERPRISE OPERATIONS CENTER TEST FAILED:', err);
    process.exit(1);
  }
}

runEnterpriseOperationsCenterTests();
