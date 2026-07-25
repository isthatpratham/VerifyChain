/**
 * aiGovernance.test.js
 * Automated Verification Test Suite for Phase 9.6 Enterprise AI Governance Platform.
 */

const assert = require('assert');
const { AIGovernance } = require('../src/aiPlatform');
const AIPolicyEngine = require('../src/aiPlatform/governance/AIPolicyEngine');
const AIOutputValidator = require('../src/aiPlatform/governance/AIOutputValidator');
const ProviderFailoverManager = require('../src/aiPlatform/governance/ProviderFailoverManager');
const AIDisasterRecoveryManager = require('../src/aiPlatform/governance/AIDisasterRecoveryManager');

async function runAIGovernanceTests() {
  console.log('=== STARTING ENTERPRISE AI GOVERNANCE TEST SUITE (PHASE 9.6) ===\n');

  try {
    // 1. Policy Engine Test
    console.log('[Test 1] Testing Dynamic Policy Engine...');
    const passPolicy = await AIPolicyEngine.evaluatePolicy({ requestedTokens: 1000, confidenceScore: 0.95 });
    assert.strictEqual(passPolicy.allowed, true);

    const failTokens = await AIPolicyEngine.evaluatePolicy({ requestedTokens: 10000, confidenceScore: 0.95 });
    assert.strictEqual(failTokens.allowed, false);
    assert.strictEqual(failTokens.policyCode, 'TOKEN_BUDGET_EXCEEDED');

    const failConf = await AIPolicyEngine.evaluatePolicy({ requestedTokens: 1000, confidenceScore: 0.50 });
    assert.strictEqual(failConf.allowed, false);
    assert.strictEqual(failConf.policyCode, 'CONFIDENCE_BELOW_THRESHOLD');
    console.log('✔ Dynamic Policy Engine passed.');

    // 2. Output Validator Test
    console.log('\n[Test 2] Testing Output Validation Pipeline...');
    const validOut = AIOutputValidator.validateOutput({
      payload: { title: 'Report', confidenceScore: 0.96 },
      requiredFields: ['title'],
      minConfidence: 0.85,
    });
    assert.strictEqual(validOut.isValid, true);

    const invalidOut = AIOutputValidator.validateOutput({
      payload: { confidenceScore: 0.96 },
      requiredFields: ['title'],
      minConfidence: 0.85,
    });
    assert.strictEqual(invalidOut.isValid, false);
    console.log('✔ Output Validation Pipeline passed.');

    // 3. Provider Failover Circuit Breaker Test
    console.log('\n[Test 3] Testing Provider Failover Circuit Breaker...');
    const initialRes = ProviderFailoverManager.resolveProvider('OPENAI');
    assert.strictEqual(initialRes.isFailover, false);

    // Trip circuit breaker with 3 failures
    ProviderFailoverManager.recordFailure('OPENAI');
    ProviderFailoverManager.recordFailure('OPENAI');
    ProviderFailoverManager.recordFailure('OPENAI');

    const trippedRes = ProviderFailoverManager.resolveProvider('OPENAI');
    assert.strictEqual(trippedRes.isFailover, true);
    assert.strictEqual(trippedRes.resolvedProvider, 'MOCK');

    // Reset circuit breaker
    ProviderFailoverManager.recordSuccess('OPENAI');
    const resetRes = ProviderFailoverManager.resolveProvider('OPENAI');
    assert.strictEqual(resetRes.isFailover, false);
    console.log('✔ Provider Failover Circuit Breaker passed.');

    // 4. Cost Optimizer Quota Test
    console.log('\n[Test 4] Testing Cost Optimizer Quota Engine...');
    const quota = await AIGovernance.getCostQuota(101);
    assert.ok(quota.daily_token_limit, 'Daily token limit configured');
    console.log(`✔ Cost Optimizer passed (Daily Limit: ${quota.daily_token_limit} tokens).`);

    // 5. Evaluation Engine Metrics Test
    console.log('\n[Test 5] Testing Evaluation Engine Metrics...');
    const evals = await AIGovernance.getEvaluations();
    assert.ok(evals.length > 0, 'Evaluation metrics returned');
    assert.ok(evals[0].grounding_precision >= 0.90, 'Grounding precision threshold verified');
    console.log(`✔ Evaluation Engine passed (Precision: ${(evals[0].grounding_precision * 100).toFixed(0)}%).`);

    // 6. Human Approval Task Workflow Test
    console.log('\n[Test 6] Testing Human Oversight Approval Workflow...');
    const tasks = await AIGovernance.getPendingApprovals(101);
    assert.ok(tasks.length > 0, 'Pending approval tasks returned');
    console.log(`✔ Human Oversight Approval Inbox passed (${tasks.length} pending task(s)).`);

    // 7. Disaster Recovery Fallback Test
    console.log('\n[Test 7] Testing Disaster Recovery Fallback Manager...');
    const fallback = AIDisasterRecoveryManager.executeFallback({ failedOperation: 'TEST_LLM' });
    assert.strictEqual(fallback.status, 'FALLBACK_EXECUTED');
    assert.strictEqual(fallback.data.isFallback, true);
    console.log('✔ Disaster Recovery Fallback Manager passed.');

    console.log('\n=== ENTERPRISE AI GOVERNANCE PASSED ALL VERIFICATIONS (PHASE 9.6) ===');
  } catch (err) {
    console.error('\n❌ ENTERPRISE AI GOVERNANCE TEST FAILED:', err);
    process.exit(1);
  }
}

runAIGovernanceTests();
