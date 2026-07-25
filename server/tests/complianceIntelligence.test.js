/**
 * complianceIntelligence.test.js
 * Automated Verification Test Suite for Phase 9.2 AI Compliance Intelligence Engine.
 */

const assert = require('assert');
const {
  ComplianceIntelligence,
  GapAnalyzer,
  RiskAnalyzer,
  RecommendationEngine,
  PriorityEngine,
  ActionPlanner,
  SummaryGenerator,
  ExplanationEngine,
  ConfidenceScorer,
  GuardrailsEngine,
} = require('../src/complianceIntelligence');

async function runComplianceIntelligenceTests() {
  console.log('=== STARTING AI COMPLIANCE INTELLIGENCE TEST SUITE (PHASE 9.2) ===\n');

  try {
    // 1. Gap Detection Test
    console.log('[Test 1] Testing Compliance Gap Detection Engine...');
    const contextMock = {
      msmeId: 101,
      business: { organizationName: 'Acme Heavy Engineering', gstin: '27AAAAA0000A1Z5', verificationStatus: 'UNVERIFIED' },
      compliance: { overallHealthScore: 88, pendingRenewals: 2 },
      trust: { trustScore: 82, trustBadge: 'SILVER_SUPPLIER' },
    };

    const gaps = await GapAnalyzer.detectGaps(contextMock);
    assert.ok(gaps.length >= 2, 'Gap analyzer should detect profile and renewal gaps');
    assert.ok(gaps.some((g) => g.category === 'EXPIRY'), 'Should detect document expiry gap');
    console.log(`✔ Gap Detection Engine passed (${gaps.length} gaps identified).`);

    // 2. Risk Assessment Engine Test
    console.log('\n[Test 2] Testing Risk Assessment Engine...');
    const riskAssessment = await RiskAnalyzer.analyzeRisk(contextMock, gaps);
    assert.ok(riskAssessment, 'Risk assessment result should exist');
    assert.ok(riskAssessment.overallRiskScore > 0, 'Risk score should be calculated');
    assert.ok(riskAssessment.complianceRisk !== undefined, 'Compliance risk score calculated');
    assert.ok(riskAssessment.regulatoryRisk !== undefined, 'Regulatory risk score calculated');
    console.log(`✔ Risk Assessment Engine passed (Overall Risk Score: ${riskAssessment.overallRiskScore}/100, Severity: ${riskAssessment.overallSeverity}).`);

    // 3. Priority Engine Test
    console.log('\n[Test 3] Testing Priority Engine...');
    const criticalPriority = PriorityEngine.calculatePriority({ severity: 'CRITICAL', daysToExpiry: 5 });
    assert.strictEqual(criticalPriority, 'CRITICAL', 'Urgent expiry should be CRITICAL priority');

    const highPriority = PriorityEngine.calculatePriority({ severity: 'HIGH', businessImpact: 'HIGH', daysToExpiry: 20 });
    assert.strictEqual(highPriority, 'HIGH', '30-day expiry should be HIGH priority');
    console.log('✔ Priority Engine passed.');

    // 4. Recommendation Engine & Explainability Test
    console.log('\n[Test 4] Testing Recommendation Engine & Explainability Engine...');
    const recommendations = await RecommendationEngine.generateRecommendations(101, contextMock, gaps, riskAssessment);
    assert.ok(recommendations.length > 0, 'Recommendations should be generated');

    const firstRec = recommendations[0];
    assert.ok(firstRec.title, 'Recommendation title exists');
    assert.ok(firstRec.reasoning, 'Reasoning exists');
    assert.ok(firstRec.explanation, 'Explanation object exists');
    assert.ok(firstRec.explanation.whyExists, 'Explanation whyExists exists');
    assert.ok(firstRec.confidenceScore >= 0.70, 'Confidence score meets threshold');
    console.log(`✔ Recommendation Engine passed (${recommendations.length} explainable recommendations generated).`);

    // 5. Action Planner Test
    console.log('\n[Test 5] Testing Action Planner Engine...');
    const actionPlans = await ActionPlanner.generateActionPlans(101, gaps);
    assert.ok(actionPlans.length > 0, 'Action plans should be generated');
    assert.ok(actionPlans[0].actionSteps.length > 0, 'Action plan contains action steps');
    console.log(`✔ Action Planner Engine passed (${actionPlans.length} action plans generated).`);

    // 6. Summary Generator Test
    console.log('\n[Test 6] Testing Executive Summary Generator Engine...');
    const executiveSummary = await SummaryGenerator.generateExecutiveSummary(101, contextMock, riskAssessment, gaps);
    assert.ok(executiveSummary, 'Executive summary created');
    assert.ok(executiveSummary.compliancePosture, 'Compliance posture set');
    assert.ok(executiveSummary.summaryText, 'Summary text generated');
    console.log(`✔ Executive Summary Generator passed (Posture: ${executiveSummary.compliancePosture}).`);

    // 7. Confidence Scorer & Guardrails Test
    console.log('\n[Test 7] Testing Confidence Scorer & Guardrails Engine...');
    const confidenceReport = ConfidenceScorer.calculateConfidence(contextMock);
    assert.ok(confidenceReport.confidenceScore > 0.8, 'Confidence score calculated');

    const filteredRecs = GuardrailsEngine.validateOutput([{ title: 'Valid', description: 'Desc', confidenceScore: 0.95 }, { title: 'Low', description: 'Desc', confidenceScore: 0.40 }], 0.70);
    assert.strictEqual(filteredRecs.length, 1, 'Guardrails should filter low-confidence recommendations');
    console.log('✔ Confidence Scorer & Guardrails passed.');

    // 8. Full Facade Integration Test
    console.log('\n[Test 8] Testing ComplianceIntelligence Application Facade...');
    const fullAnalysis = await ComplianceIntelligence.runFullAnalysis({ msmeId: 101, userId: 'USER_101' });
    assert.ok(fullAnalysis.executiveSummary, 'Full analysis contains executive summary');
    assert.ok(fullAnalysis.recommendations.length > 0, 'Full analysis contains recommendations');
    assert.ok(fullAnalysis.riskAssessment, 'Full analysis contains risk assessment');
    assert.ok(fullAnalysis.actionPlans.length > 0, 'Full analysis contains action plans');
    console.log('✔ ComplianceIntelligence Application Facade passed.');

    console.log('\n=== AI COMPLIANCE INTELLIGENCE ENGINE PASSED ALL VERIFICATIONS (PHASE 9.2) ===');
  } catch (err) {
    console.error('\n❌ AI COMPLIANCE INTELLIGENCE TEST FAILED:', err);
    process.exit(1);
  }
}

runComplianceIntelligenceTests();
