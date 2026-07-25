/**
 * predictiveIntelligence.test.js
 * Automated Verification Test Suite for Phase 9.5 Predictive Intelligence Platform.
 */

const assert = require('assert');
const {
  PredictiveIntelligence,
  ForecastEngine,
  TrendAnalyzer,
  AnomalyDetector,
  RenewalPredictor,
  TrustPredictor,
  RiskPredictor,
  ScenarioSimulator,
  EarlyWarningCenter,
} = require('../src/predictiveIntelligence');

async function runPredictiveIntelligenceTests() {
  console.log('=== STARTING PREDICTIVE INTELLIGENCE TEST SUITE (PHASE 9.5) ===\n');

  try {
    // 1. Trend Analyzer Test
    console.log('[Test 1] Testing Historical Trend Analyzer...');
    const trend = await TrendAnalyzer.analyzeTrend(101, 'TRUST_SCORE');
    assert.strictEqual(trend.msmeId, 101);
    assert.ok(trend.trendDirection, 'Trend direction evaluated');
    assert.ok(trend.historicalPoints.length > 0, 'Historical trend points returned');
    console.log(`✔ Historical Trend Analyzer passed (Slope: ${trend.slopeValue}, Direction: ${trend.trendDirection}).`);

    // 2. Anomaly Detector Test
    console.log('\n[Test 2] Testing Anomaly Detector...');
    const anomalies = await AnomalyDetector.detectAnomalies(101);
    assert.ok(anomalies.length > 0, 'Anomalies detected');
    assert.ok(anomalies[0].explanation, 'Anomaly includes explainable text');
    console.log(`✔ Anomaly Detector passed (${anomalies.length} anomaly record(s) flagged).`);

    // 3. Renewal & Trust Predictors Test
    console.log('\n[Test 3] Testing Renewal & Trust Predictor Engines...');
    const trustFc = TrustPredictor.predictTrustScore({ currentTrust: 95.0, slope: 0.05 });
    assert.strictEqual(trustFc.projected30dTrust, 96.5);
    assert.strictEqual(trustFc.degradationRisk, 'LOW');

    const renewals = await RenewalPredictor.predictRenewals(101);
    assert.ok(renewals.length > 0, 'Renewal predictions returned');
    console.log(`✔ Renewal & Trust Predictors passed (30d Trust: ${trustFc.projected30dTrust}).`);

    // 4. Scenario Simulator Test
    console.log('\n[Test 4] Testing "What-If" Scenario Simulator...');
    const simulation = ScenarioSimulator.runSimulation({ scenarioType: 'GST_DELAY', msmeId: 101 });
    assert.strictEqual(simulation.scenarioType, 'GST_DELAY');
    assert.strictEqual(simulation.simulatedResults.trustImpact, -12.5);
    assert.strictEqual(simulation.simulatedResults.businessImpact, 'HIGH');
    console.log(`✔ Scenario Simulator passed (Impact: ${simulation.simulatedResults.businessImpact}, Trust Change: ${simulation.simulatedResults.trustImpact} pts).`);

    // 5. Early Warning Center Test
    console.log('\n[Test 5] Testing Proactive Early Warning Center...');
    const warnings = await EarlyWarningCenter.getEarlyWarnings(101);
    assert.ok(warnings.length > 0, 'Early warnings generated');
    assert.ok(warnings[0].preventive_action, 'Warning contains preventive action plan');
    console.log(`✔ Early Warning Center passed (${warnings.length} active warning(s)).`);

    // 6. Full Forecast Engine & Predictive Intelligence Facade Test
    console.log('\n[Test 6] Testing Predictive Intelligence Facade...');
    const forecast = await PredictiveIntelligence.getForecast(101);
    assert.strictEqual(forecast.msmeId, 101);
    assert.ok(forecast.trustForecast, 'Trust forecast synthesized');
    assert.ok(forecast.riskForecast, 'Risk forecast synthesized');
    assert.ok(forecast.renewalForecasts, 'Renewal forecasts synthesized');
    console.log(`✔ Predictive Intelligence Facade passed (Overall Confidence: ${(forecast.overallConfidenceScore * 100).toFixed(0)}%).`);

    console.log('\n=== PREDICTIVE INTELLIGENCE PASSED ALL VERIFICATIONS (PHASE 9.5) ===');
  } catch (err) {
    console.error('\n❌ PREDICTIVE INTELLIGENCE TEST FAILED:', err);
    process.exit(1);
  }
}

runPredictiveIntelligenceTests();
