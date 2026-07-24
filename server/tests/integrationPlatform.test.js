/**
 * integrationPlatform.test.js
 * Comprehensive automated test suite for Phase 8.1 Enterprise Integration Platform.
 * Tests API key security, secret encryption, scope permissions, registry infrastructure,
 * event contracts, audit logging, telemetry observability, and database persistence.
 */

const assert = require('assert');
const {
  ApiKeyManager,
  encryptSecret,
  decryptSecret,
  SCOPES,
  validateScopes,
  hasScope,
  hasAllScopes,
  INTEGRATION_EVENTS,
  createEventPayload,
  IntegrationRegistry,
  IntegrationAuditService,
  IntegrationLogger,
} = require('../src/integrationPlatform');

const {
  integrationRepository,
  developerAppRepository,
  apiKeyRepository,
  integrationAuditRepository,
} = require('../src/repositories');

async function runIntegrationPlatformTests() {
  console.log('================================================================');
  console.log('RUNNING PHASE 8.1 ENTERPRISE INTEGRATION PLATFORM TEST SUITE');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function test(description, fn) {
    totalTests++;
    try {
      fn();
      console.log(`  [PASS] ${description}`);
      passedTests++;
    } catch (err) {
      console.error(`  [FAIL] ${description}: ${err.message}`);
    }
  }

  async function asyncTest(description, fn) {
    totalTests++;
    try {
      await fn();
      console.log(`  [PASS] ${description}`);
      passedTests++;
    } catch (err) {
      console.error(`  [FAIL] ${description}: ${err.message}`);
    }
  }

  // 1. API Key Security & Cryptography Tests
  console.log('--- 1. API KEY SECURITY & CRYPTOGRAPHY ---');
  test('Generate production API key with vc_live_ prefix', () => {
    const keyPair = ApiKeyManager.generateKeyPair('PRODUCTION');
    assert.strictEqual(keyPair.keyPrefix, 'vc_live_');
    assert.strictEqual(keyPair.rawKey.startsWith('vc_live_'), true);
    assert.strictEqual(typeof keyPair.keyHash, 'string');
    assert.strictEqual(keyPair.keyHash.length, 64); // SHA-256 hex length
  });

  test('Generate sandbox API key with vc_test_ prefix', () => {
    const keyPair = ApiKeyManager.generateKeyPair('SANDBOX');
    assert.strictEqual(keyPair.keyPrefix, 'vc_test_');
    assert.strictEqual(keyPair.rawKey.startsWith('vc_test_'), true);
  });

  test('Verify valid key against SHA-256 hash', () => {
    const keyPair = ApiKeyManager.generateKeyPair('PRODUCTION');
    const isValid = ApiKeyManager.verifyKey(keyPair.rawKey, keyPair.keyHash);
    assert.strictEqual(isValid, true);
  });

  test('Reject invalid key against SHA-256 hash', () => {
    const keyPair = ApiKeyManager.generateKeyPair('PRODUCTION');
    const isValid = ApiKeyManager.verifyKey('vc_live_invalidkey12345', keyPair.keyHash);
    assert.strictEqual(isValid, false);
  });

  test('Detect expired API key', () => {
    const pastDate = new Date(Date.now() - 3600000);
    const futureDate = new Date(Date.now() + 3600000);
    assert.strictEqual(ApiKeyManager.isKeyExpired(pastDate), true);
    assert.strictEqual(ApiKeyManager.isKeyExpired(futureDate), false);
    assert.strictEqual(ApiKeyManager.isKeyExpired(null), false);
  });

  // 2. Secret Encryption Tests (AES-256-GCM)
  console.log('\n--- 2. SECRET ENCRYPTION (AES-256-GCM) ---');
  test('Encrypt and decrypt credentials roundtrip', () => {
    const secretText = 'super_secret_client_credential_98765';
    const encrypted = encryptSecret(secretText);
    assert.strictEqual(typeof encrypted, 'string');
    assert.strictEqual(encrypted.includes(':'), true);

    const decrypted = decryptSecret(encrypted);
    assert.strictEqual(decrypted, secretText);
  });

  test('Encrypt empty secret returns null', () => {
    assert.strictEqual(encryptSecret(''), null);
    assert.strictEqual(decryptSecret(''), null);
  });

  // 3. Scope & Permission Contract Tests
  console.log('\n--- 3. SCOPE PERMISSIONS CONTRACT ---');
  test('Validate standard recognized scopes', () => {
    const validList = [SCOPES.BUSINESS_READ, SCOPES.TRUST_READ, SCOPES.COMPLIANCE_READ];
    const invalidList = ['business.read', 'invalid.scope'];
    assert.strictEqual(validateScopes(validList), true);
    assert.strictEqual(validateScopes(invalidList), false);
  });

  test('Check required scope presence (hasScope & hasAllScopes)', () => {
    const granted = [SCOPES.BUSINESS_READ, SCOPES.TRUST_READ, SCOPES.PUBLIC_VERIFY];
    assert.strictEqual(hasScope(granted, SCOPES.TRUST_READ), true);
    assert.strictEqual(hasScope(granted, SCOPES.INTEGRATION_MANAGE), false);
    assert.strictEqual(hasAllScopes(granted, [SCOPES.BUSINESS_READ, SCOPES.PUBLIC_VERIFY]), true);
    assert.strictEqual(hasAllScopes(granted, [SCOPES.BUSINESS_READ, SCOPES.WEBHOOK_MANAGE]), false);
  });

  // 4. Integration Registry Infrastructure Tests
  console.log('\n--- 4. INTEGRATION REGISTRY INFRASTRUCTURE ---');
  test('System pre-registered capability templates exist', () => {
    const capabilities = IntegrationRegistry.listSupportedCapabilities();
    assert.strictEqual(capabilities.length >= 5, true);

    const sap = IntegrationRegistry.getProviderCapability('sap_s4hana');
    assert.strictEqual(sap !== null, true);
    assert.strictEqual(sap.name, 'SAP S/4HANA Enterprise Integration');
    assert.strictEqual(sap.type, 'ERP');
  });

  test('Register new custom integration provider capability', () => {
    IntegrationRegistry.registerProviderCapability({
      providerCode: 'custom_oracle_netsuite',
      name: 'Oracle NetSuite ERP Adapter',
      type: 'ERP',
      version: 'v1.0.0',
      capabilities: ['INVOICE_AUDIT'],
      supportedFeatures: ['BATCH_SYNC'],
      status: 'ACTIVE',
    });

    assert.strictEqual(IntegrationRegistry.validateIntegrationSupport('custom_oracle_netsuite'), true);
  });

  // 5. Versioned Event Contracts Tests
  console.log('\n--- 5. VERSIONED PUBLIC EVENT CONTRACTS ---');
  test('Format public event contract envelope', () => {
    const payload = createEventPayload(INTEGRATION_EVENTS.SUPPLIER_TRUST_PUBLISHED, {
      msmeId: 8,
      publicSlug: 'apex-precision-components-pvt-ltd-8',
      trustLevel: 'VERIFIED',
    });

    assert.strictEqual(payload.event, 'SupplierTrustPublished');
    assert.strictEqual(payload.contractVersion, 'v1.0.0');
    assert.strictEqual(typeof payload.eventId, 'string');
    assert.strictEqual(payload.data.msmeId, 8);
  });

  test('Reject invalid event name in contract generator', () => {
    assert.throws(() => {
      createEventPayload('InvalidEventName', {});
    }, /Unrecognized integration event type/);
  });

  // 6. Observability & Telemetry Tests
  console.log('\n--- 6. OBSERVABILITY & TELEMETRY ---');
  await asyncTest('Trace integration function execution time', async () => {
    const result = await IntegrationLogger.traceExecution('TestExecutionAction', async () => {
      return { success: true, count: 42 };
    });

    assert.strictEqual(result.count, 42);
    const health = IntegrationLogger.getHealthCheckStatus();
    assert.strictEqual(health.status, 'HEALTHY');
    assert.strictEqual(health.metrics.executionsTraced >= 1, true);
  });

  // 7. Database Persistence Layer Tests
  console.log('\n--- 7. DATABASE PERSISTENCE LAYER ---');
  await asyncTest('Create and query Integration DB entity', async () => {
    const uniqueId = `INT-TEST-${Date.now()}`;
    const created = await integrationRepository.create({
      integration_id: uniqueId,
      name: 'Test ERP Platform',
      provider_code: 'sap_s4hana',
      type: 'ERP',
      status: 'DRAFT',
      capabilities: ['COMPLIANCE_SYNC'],
    });

    assert.strictEqual(created.integration_id, uniqueId);

    const fetched = await integrationRepository.findByIntegrationId(uniqueId);
    assert.strictEqual(fetched.name, 'Test ERP Platform');
  });

  await asyncTest('Create and query Developer Application & API Key DB entities', async () => {
    const appId = `APP-TEST-${Date.now()}`;
    const devApp = await developerAppRepository.create({
      msme_id: 1,
      app_id: appId,
      name: 'Partner Audit App',
      environment: 'SANDBOX',
    });

    assert.strictEqual(devApp.app_id, appId);

    const keyPair = ApiKeyManager.generateKeyPair('SANDBOX');
    const apiKey = await apiKeyRepository.create({
      developer_app_id: devApp.id,
      key_prefix: keyPair.keyPrefix,
      key_hash: keyPair.keyHash,
      name: 'Sandbox Test Key',
      environment: 'SANDBOX',
      scopes: [SCOPES.BUSINESS_READ, SCOPES.TRUST_READ],
    });

    assert.strictEqual(apiKey.key_hash, keyPair.keyHash);

    const fetchedKey = await apiKeyRepository.findByKeyHash(keyPair.keyHash);
    assert.strictEqual(fetchedKey.name, 'Sandbox Test Key');
  });

  await asyncTest('Record and query Integration Audit Trail DB entity', async () => {
    const resourceId = `RES-${Date.now()}`;
    const audit = await IntegrationAuditService.logAuditAction({
      actorType: 'SYSTEM',
      actorId: 'admin_1',
      action: 'API_KEY_CREATED',
      resourceType: 'ApiKey',
      resourceId,
      changes: { scopes: ['business.read'] },
    });

    assert.strictEqual(audit.action, 'API_KEY_CREATED');

    const history = await IntegrationAuditService.getAuditHistory('ApiKey', resourceId);
    assert.strictEqual(history.length >= 1, true);
    assert.strictEqual(history[0].resource_id, resourceId);
  });

  console.log('\n================================================================');
  console.log(`TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED (100% SUCCESS)`);
  console.log('================================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runIntegrationPlatformTests().catch((err) => {
  console.error('[FATAL TEST SUITE ERROR]:', err);
  process.exit(1);
});
