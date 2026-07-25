/**
 * aiPlatform.test.js
 * Automated Verification Test Suite for Enterprise AI Platform (Phase 9.1).
 */

const assert = require('assert');
const {
  AIService,
  ProviderFactory,
  ModelRegistry,
  PromptOrchestrator,
  AIContextBuilder,
  MemoryManager,
  TokenAccountingService,
  AIAuditService,
  AIPlatformConfig,
} = require('../src/aiPlatform');

async function runAIPlatformTests() {
  console.log('=== STARTING ENTERPRISE AI PLATFORM TEST SUITE (PHASE 9.1) ===\n');

  try {
    // 1. Provider Factory Abstraction Test
    console.log('[Test 1] Testing Provider Factory & Abstraction...');
    const mockProvider = ProviderFactory.getProvider('MOCK');
    assert.ok(mockProvider, 'Mock provider should be returned');
    assert.strictEqual(mockProvider.providerCode, 'MOCK');

    const openAIProvider = ProviderFactory.getProvider('OPENAI');
    assert.strictEqual(openAIProvider.providerCode, 'OPENAI');

    const providersList = ProviderFactory.listProviders();
    assert.ok(providersList.length >= 6, 'Should list registered providers');
    console.log('✔ Provider Factory abstraction passed.');

    // 2. Mock Model Completion Execution
    console.log('\n[Test 2] Testing Mock Model Execution...');
    const completion = await mockProvider.generateCompletion({
      systemPrompt: 'Evaluate compliance risk',
      userPrompt: 'Evaluate MSME 101',
      modelCode: 'mock-gpt-4o',
    });

    assert.ok(completion, 'Completion response should exist');
    assert.strictEqual(completion.providerCode, 'MOCK');
    assert.ok(completion.parsedOutput, 'Parsed JSON output should exist');
    assert.ok(completion.totalTokens > 0, 'Tokens should be accounted');
    console.log(`✔ Mock Model execution passed (Tokens: ${completion.totalTokens}, Latency: ${completion.latencyMs}ms).`);

    // 3. Model Registry Test
    console.log('\n[Test 3] Testing Model Registry...');
    const models = await ModelRegistry.listModels();
    assert.ok(models.length >= 4, 'Model registry should contain built-in models');

    const defaultModel = await ModelRegistry.getModel('mock-gpt-4o');
    assert.ok(defaultModel, 'Default model metadata should be retrieved');
    assert.strictEqual(defaultModel.modelCode, 'mock-gpt-4o');
    console.log('✔ Model Registry passed.');

    // 4. Prompt Orchestration & Variable Substitution Test
    console.log('\n[Test 4] Testing Prompt Orchestration & Variable Substitution...');
    const promptResponse = await PromptOrchestrator.executePrompt({
      templateCode: 'COMPLIANCE_EVALUATION_TEMPLATE',
      variables: { organizationName: 'Acme Metal Pvt Ltd', gstin: '27AAAAA0000A1Z5', pan: 'AAAAA0000A' },
      context: { msmeId: 101, complianceScore: 95 },
      providerCode: 'MOCK',
      modelCode: 'mock-gpt-4o',
    });

    assert.ok(promptResponse, 'Prompt orchestration response should exist');
    assert.ok(promptResponse.parsedOutput, 'Output should be valid JSON');
    assert.ok(promptResponse.parsedOutput.status, 'Parsed output contains compliance status');
    console.log('✔ Prompt Orchestration passed.');

    // 5. Unified AI Context Builder Test
    console.log('\n[Test 5] Testing AI Context Builder...');
    const unifiedContext = await AIContextBuilder.buildUnifiedContext({
      msmeId: 101,
      userId: 'USER_101',
      domains: ['BUSINESS', 'COMPLIANCE', 'TRUST'],
    });

    assert.ok(unifiedContext.business, 'Business context should be included');
    assert.ok(unifiedContext.compliance, 'Compliance context should be included');
    assert.ok(unifiedContext.trust, 'Trust context should be included');
    console.log('✔ AI Context Builder passed.');

    // 6. Memory Architecture Test
    console.log('\n[Test 6] Testing Memory Architecture Store & Retrieval...');
    const convMem = await MemoryManager.appendConversationMemory({
      msmeId: 101,
      conversationId: 'conv_test_1',
      userId: 'USER_101',
      role: 'user',
      content: 'Requesting compliance status evaluation',
    });
    assert.ok(convMem, 'Conversation memory appended');

    const history = await MemoryManager.getConversationHistory(101, 'conv_test_1');
    assert.ok(history.length > 0, 'Conversation history retrieved');

    const orgMem = await MemoryManager.setOrganizationMemory({
      msmeId: 101,
      memoryKey: 'PREFERRED_AI_PROVIDER',
      memoryValue: 'MOCK',
    });
    assert.ok(orgMem, 'Org memory saved');

    const retrievedOrgMem = await MemoryManager.getOrganizationMemory(101, 'PREFERRED_AI_PROVIDER');
    assert.strictEqual(retrievedOrgMem, 'MOCK', 'Org memory retrieved');
    console.log('✔ Memory Architecture passed.');

    // 7. Token Accounting & AI Audit Test
    console.log('\n[Test 7] Testing Token Accounting & AI Audit...');
    const usageRecord = await TokenAccountingService.logUsage({
      msmeId: 101,
      userId: 'USER_101',
      templateCode: 'COMPLIANCE_EVALUATION_TEMPLATE',
      providerCode: 'MOCK',
      modelCode: 'mock-gpt-4o',
      promptTokens: 120,
      completionTokens: 80,
      totalTokens: 200,
      estimatedCost: 0.00034,
      latencyMs: 180,
      status: 'SUCCESS',
    });
    assert.ok(usageRecord, 'Token usage record created');

    const analytics = await TokenAccountingService.getUsageAnalytics({ msmeId: 101 });
    assert.ok(analytics.totalTokens > 0, 'Usage analytics total tokens should be positive');

    const auditLogs = await AIAuditService.getAuditLogs({ msmeId: 101 });
    assert.ok(auditLogs.length > 0, 'AI Audit logs should be retrieved');
    console.log('✔ Token Accounting & AI Audit passed.');

    // 8. End-to-End AIService Application Facade Test
    console.log('\n[Test 8] Testing AIService Application Facade...');
    const facadeResult = await AIService.executePrompt({
      templateCode: 'SUPPLIER_TRUST_SUMMARY_TEMPLATE',
      variables: { organizationName: 'Global Corp', msmeId: 101 },
      msmeId: 101,
      userId: 'USER_101',
      providerCode: 'MOCK',
    });

    assert.ok(facadeResult, 'AIService facade response returned');
    assert.strictEqual(facadeResult.providerCode, 'MOCK');
    assert.ok(facadeResult.parsedOutput, 'Parsed output exists');
    console.log('✔ AIService Application Facade passed.');

    console.log('\n=== ENTERPRISE AI PLATFORM PASSED ALL VERIFICATIONS (PHASE 9.1) ===');
  } catch (err) {
    console.error('\n❌ AI PLATFORM TEST FAILED:', err);
    process.exit(1);
  }
}

runAIPlatformTests();
