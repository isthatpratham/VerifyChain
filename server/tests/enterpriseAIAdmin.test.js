/**
 * enterpriseAIAdmin.test.js
 * Comprehensive Automated Test Suite for Phase 11.4 Enterprise AI Administration & Governance.
 */

const assert = require('assert');
const {
  AIAdminFacade,
  ProviderRegistryService,
  ModelRegistryService,
  PromptRegistryService,
  PromptVersionService,
  QuotaService,
  AIPolicyEngine,
  AIConfigurationService,
  AIAuditService,
  AIAdministrationService,
} = require('../src/aiAdmin');

async function runEnterpriseAIAdminTests() {
  console.log('================================================================');
  console.log('  STARTING ENTERPRISE AI ADMINISTRATION TEST SUITE (11.4)');
  console.log('================================================================\n');

  try {
    // ─── TEST 1: PROVIDER REGISTRY SEEDING & STATUS ──────────────────────
    console.log('[Test 1] Testing Provider Registry & Priority Management...');
    const providers = await AIAdminFacade.listProviders();
    assert.ok(providers.length >= 6, '6 standard AI providers registered');

    const updatedProvider = await AIAdminFacade.updateProvider({
      key: 'GEMINI',
      priority: 1,
    });
    assert.strictEqual(updatedProvider.key, 'GEMINI', 'Google Gemini provider updated');
    console.log('✔ Provider Registry passed.');

    // ─── TEST 2: MODEL CATALOG REGISTRY & CAPABILITIES ───────────────────
    console.log('\n[Test 2] Testing Model Catalog & Capability Flags...');
    const models = await AIAdminFacade.listModels();
    assert.ok(models.length >= 4, '4 standard AI models registered');

    const geminiModel = models.find(m => m.key === 'gemini-1.5-pro');
    assert.ok(geminiModel, 'gemini-1.5-pro found in model catalog');
    assert.strictEqual(geminiModel.supports_streaming, true, 'Streaming capability flagged as true');
    console.log('✔ Model Catalog Registry passed.');

    // ─── TEST 3: PROMPT LIBRARY & IMMUTABLE VERSIONING ───────────────────
    console.log('\n[Test 3] Testing Prompt Library & Immutable Versioning Engine...');
    const prompts = await AIAdminFacade.listPrompts();
    assert.ok(prompts.length >= 3, 'Standard production prompts seeded');

    const firstPrompt = prompts[0];
    const newVersion = await AIAdminFacade.createNewVersion({
      promptId: firstPrompt.id,
      templateText: 'Updated template text with extra variables {{businessName}} and {{gapDetails}}',
      variables: ['businessName', 'gapDetails'],
      authorId: 'CHIEF_COMPLIANCE_OFFICER',
      reviewNotes: 'Version 2 updated with gapDetails variable',
    });

    assert.ok(newVersion.id, 'New prompt version generated');
    assert.strictEqual(newVersion.version_number, 2, 'Version number incremented to 2');

    // Rollback Check
    const rolledBack = await AIAdminFacade.rollbackPrompt(firstPrompt.id, 1, 'ADMIN');
    assert.strictEqual(rolledBack.version_number, 3, 'Rollback created immutable Version 3 restoring Version 1 template');
    console.log('✔ Prompt Library & Versioning passed.');

    // ─── TEST 4: AI GOVERNANCE POLICIES ──────────────────────────────────
    console.log('\n[Test 4] Testing AI Governance Policies & Rules Engine...');
    const policies = await AIAdminFacade.listPolicies();
    assert.ok(policies.length >= 3, 'Default AI governance policies registered');

    const updatedPolicy = await AIAdminFacade.updatePolicy({
      code: 'HUMAN_APPROVAL_THRESHOLD',
      rules: { confidenceThreshold: 0.90 },
    });
    assert.strictEqual(updatedPolicy.code, 'HUMAN_APPROVAL_THRESHOLD', 'Policy threshold updated');
    console.log('✔ AI Governance Policies passed.');

    // ─── TEST 5: AI QUOTA MANAGEMENT ─────────────────────────────────────
    console.log('\n[Test 5] Testing AI Quota Limits per Organization & User...');
    const quotas = await AIAdminFacade.listQuotas();
    assert.ok(quotas.length >= 3, 'Default AI quotas registered');

    const newQuota = await AIAdminFacade.setQuota({
      scopeType: 'ORGANIZATION',
      scopeId: 'ACME_CORP_ORG',
      dailyLimit: 25000,
      monthlyLimit: 50000000,
    });
    assert.strictEqual(newQuota.daily_request_limit, 25000, 'Daily request limit updated');
    console.log('✔ AI Quota Management passed.');

    // ─── TEST 6: AI PLATFORM CONFIGURATIONS ──────────────────────────────
    console.log('\n[Test 6] Testing AI Default Configurations...');
    const configs = await AIAdminFacade.listConfigs();
    assert.ok(configs.length >= 7, 'Default AI platform configs registered');

    const updatedConfig = await AIAdminFacade.updateConfig({
      key: 'ai.default_model',
      value: 'gemini-1.5-pro',
      category: 'GENERAL',
    });
    assert.strictEqual(updatedConfig.value_json, 'gemini-1.5-pro', 'Default model configured');
    console.log('✔ AI Default Configurations passed.');

    // ─── TEST 7: AI AUDIT EVENTS LOGGING ──────────────────────────────────
    console.log('\n[Test 7] Testing AI Governance Audit Logging...');
    const auditEvent = await AIAdminFacade.logEvent({
      action: 'PROVIDER_PRIORITY_UPDATED',
      actorId: 'SUPER_ADMIN',
      details: { provider: 'GEMINI', newPriority: 1 },
    });
    assert.ok(auditEvent.id, 'Audit event logged');

    const events = await AIAdminFacade.listEvents(5);
    assert.ok(events.length > 0, 'Audit events listed');
    console.log('✔ AI Audit Logging passed.');

    // ─── TEST 8: AI OPERATIONS DASHBOARD METRICS ─────────────────────────
    console.log('\n[Test 8] Testing AI Operations Center Dashboard Metrics...');
    const dashboard = await AIAdminFacade.getAIDashboardStats();
    assert.ok(dashboard.providersCount > 0, 'Dashboard providers count > 0');
    assert.ok(dashboard.modelsCount > 0, 'Dashboard models count > 0');
    assert.ok(dashboard.promptsCount > 0, 'Dashboard prompts count > 0');
    console.log(`✔ AI Operations Dashboard passed (Providers: ${dashboard.providersCount}, Models: ${dashboard.modelsCount}, Prompts: ${dashboard.promptsCount}).`);

    console.log('\n================================================================');
    console.log('  ENTERPRISE AI ADMINISTRATION PASSED ALL VERIFICATIONS!');
    console.log('================================================================');
  } catch (err) {
    console.error('\n❌ ENTERPRISE AI ADMIN TEST FAILED:', err);
    process.exit(1);
  }
}

runEnterpriseAIAdminTests();
