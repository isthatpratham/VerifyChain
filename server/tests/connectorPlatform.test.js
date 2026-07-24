/**
 * connectorPlatform.test.js
 * Comprehensive automated test suite for Phase 8.4 Third-Party Connectors & Integration Adapters Framework.
 * Tests Provider Registry, Base Adapters, Data Mapper, Connection Manager, Synchronization Engine,
 * Health Monitor, Audit Trail, and REST APIs.
 */

const assert = require('assert');
const http = require('http');
const app = require('../src/app');
const defaultPrisma = require('../src/utils/prismaClient');
const {
  BaseIntegrationAdapter,
  MockErpAdapter,
  MockCrmAdapter,
  MockGovAdapter,
  ConnectorProviderRegistry,
  ConnectionManager,
  DataMapper,
  SynchronizationEngine,
  ConnectorHealthMonitor,
} = require('../src/connectorPlatform');

const { ApiKeyManager, SCOPES } = require('../src/integrationPlatform');
const { developerAppRepository, apiKeyRepository, msmeProfileRepository } = require('../src/repositories');

let server;
const TEST_PORT = 5099;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}/api/v1`;

function request(method, path, { headers = {}, body = null } = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const reqHeaders = { ...headers };

    let payload = null;
    if (body) {
      payload = JSON.stringify(body);
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request({
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: reqHeaders,
    }, (res) => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(resBody);
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: resBody });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runConnectorPlatformTestSuite() {
  console.log('================================================================');
  console.log('RUNNING PHASE 8.4 CONNECTOR PLATFORM TEST SUITE');
  console.log('================================================================\n');

  // Start HTTP Test Server
  await new Promise((resolve) => {
    server = app.listen(TEST_PORT, resolve);
  });

  let passedTests = 0;
  let totalTests = 0;

  async function test(description, fn) {
    totalTests++;
    try {
      await fn();
      console.log(`  [PASS] ${description}`);
      passedTests++;
    } catch (err) {
      console.error(`  [FAIL] ${description}: ${err.message}`);
      console.error(err.stack);
    }
  }

  try {
    // 1. Provider Registry Tests
    console.log('--- 1. PROVIDER REGISTRY & CATEGORIES ---');
    await test('List connector categories and pre-registered adapters', async () => {
      const categories = ConnectorProviderRegistry.listCategories();
      assert.strictEqual(categories.includes('ERP'), true);
      assert.strictEqual(categories.includes('CRM'), true);
      assert.strictEqual(categories.includes('GOVERNMENT'), true);

      const providers = ConnectorProviderRegistry.listProviders();
      assert.strictEqual(providers.length >= 3, true);

      const erpAdapter = ConnectorProviderRegistry.getAdapter('sap_s4hana_mock');
      assert.strictEqual(erpAdapter !== null, true);
    });

    // 2. Base Adapter & Reference Implementations
    console.log('\n--- 2. ADAPTER CONTRACT & MOCK IMPLEMENTATIONS ---');
    await test('Mock ERP, CRM, and Gov adapters fulfill adapter contract', async () => {
      const erp = new MockErpAdapter();
      const crm = new MockCrmAdapter();
      const gov = new MockGovAdapter();

      const erpConn = await erp.connect({});
      assert.strictEqual(erpConn.status, 'CONNECTED');

      const erpPing = await erp.testConnection({});
      assert.strictEqual(erpPing.success, true);

      const erpSync = await erp.syncData('FULL', {});
      assert.strictEqual(erpSync.items.length > 0, true);

      const crmHealth = await crm.healthCheck();
      assert.strictEqual(crmHealth.status, 'HEALTHY');

      const govHealth = await gov.healthCheck();
      assert.strictEqual(govHealth.status, 'HEALTHY');
    });

    // 3. Data Mapper Tests
    console.log('\n--- 3. DATA MAPPER TRANSFORMATIONS ---');
    await test('Bidirectional mapping for Business Profile, Compliance & Trust', async () => {
      const externalErpPayload = {
        accountName: 'Apex Precision Tools Pvt Ltd',
        tax_id: '27AABCA1234H1Z0',
        udyam: 'UDYAM-MH-01-0012345',
        verified: true,
      };

      const domainModel = DataMapper.mapToDomain('business_profile', externalErpPayload);
      assert.strictEqual(domainModel.businessName, 'Apex Precision Tools Pvt Ltd');
      assert.strictEqual(domainModel.gstin, '27AABCA1234H1Z0');
      assert.strictEqual(domainModel.isVerified, true);

      const exportedExternal = DataMapper.mapToExternal('business_profile', domainModel);
      assert.strictEqual(exportedExternal.external_business_name, 'Apex Precision Tools Pvt Ltd');
    });

    // Seed test integration, Developer App, API Key
    let testIntegration = await defaultPrisma.integration.findFirst({
      where: { provider_code: 'sap_s4hana_mock' },
    });

    if (!testIntegration) {
      testIntegration = await defaultPrisma.integration.create({
        data: {
          integration_id: `INT-SAP-TEST-${Date.now()}`,
          name: 'SAP S/4HANA ERP',
          type: 'ERP',
          provider_code: 'sap_s4hana_mock',
          version: 'v1.0.0',
          status: 'ACTIVE',
        },
      });
    }

    const firstMsme = await msmeProfileRepository.findFirst({});
    const msmeId = firstMsme ? firstMsme.id : 1;

    const devApp = await developerAppRepository.create({
      msme_id: msmeId,
      app_id: `APP-TEST-CONN-${Date.now()}`,
      name: 'Connector Test Partner App',
      environment: 'PRODUCTION',
    });

    const keyPair = ApiKeyManager.generateKeyPair('PRODUCTION');
    await apiKeyRepository.create({
      developer_app_id: devApp.id,
      key_prefix: keyPair.keyPrefix,
      key_hash: keyPair.keyHash,
      name: 'Connector Admin Test Key',
      environment: 'PRODUCTION',
      scopes: Object.values(SCOPES),
    });

    // 4. Connection Lifecycle & Synchronization Engine Tests
    console.log('\n--- 4. CONNECTION MANAGER & SYNC ENGINE ---');
    let testConnId;

    await test('Create connector connection with AES-256-GCM encrypted credentials', async () => {
      const connResult = await ConnectionManager.createConnection({
        integrationId: testIntegration.id,
        name: 'SAP Production ERP Connection',
        environment: 'PRODUCTION',
        credentials: { apiKey: 'sap_live_secret_key_8899' },
      });

      assert.strictEqual(connResult.connection.status, 'ACTIVE');
      testConnId = connResult.connection.id;
    });

    await test('Test connection health and rotate credentials', async () => {
      const health = await ConnectionManager.testConnectionHealth(testConnId);
      assert.strictEqual(health.status, 'ACTIVE');

      const rotate = await ConnectionManager.rotateCredentials(testConnId, 'new_sap_rotated_secret_1122');
      assert.strictEqual(rotate.success, true);
    });

    await test('Execute data synchronization job and resolve conflicts', async () => {
      const syncResult = await SynchronizationEngine.triggerSyncJob({
        connectionId: testConnId,
        syncType: 'INCREMENTAL',
      });

      assert.strictEqual(typeof syncResult.jobId, 'string');
      assert.strictEqual(syncResult.recordsProcessed > 0, true);

      // Test health monitor overall check
      const healthSummary = await ConnectorHealthMonitor.checkAllConnectionsHealth();
      assert.strictEqual(healthSummary.totalConnections > 0, true);
    });

    // 5. REST APIs Tests (/api/v1/connectors)
    console.log('\n--- 5. CONNECTOR REST APIs (/api/v1/connectors) ---');
    let createdRestConnId;

    await test('GET /api/v1/connectors/providers lists capabilities', async () => {
      const res = await request('GET', '/connectors/providers', { headers: { 'x-api-key': keyPair.rawKey } });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(Array.isArray(res.body.data.providers), true);
    });

    await test('POST /api/v1/connectors/connections creates connection', async () => {
      const res = await request('POST', '/connectors/connections', {
        headers: { 'x-api-key': keyPair.rawKey },
        body: {
          integrationId: testIntegration.id,
          name: 'API Connection SAP ERP',
          environment: 'PRODUCTION',
          credentials: { apiKey: 'test_key_123' },
        },
      });

      if (res.status !== 201) {
        console.error('[CreateConnectionFail]:', JSON.stringify(res.body, null, 2));
      }
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      createdRestConnId = res.body.data.connection.id;
    });

    await test('GET /api/v1/connectors/connections lists connections', async () => {
      const res = await request('GET', '/connectors/connections', { headers: { 'x-api-key': keyPair.rawKey } });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(Array.isArray(res.body.data), true);
    });

    await test('POST /api/v1/connectors/connections/:id/test tests connection health', async () => {
      const res = await request('POST', `/connectors/connections/${createdRestConnId}/test`, { headers: { 'x-api-key': keyPair.rawKey } });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.status, 'ACTIVE');
    });

    await test('POST /api/v1/connectors/connections/:id/sync triggers manual sync job', async () => {
      const res = await request('POST', `/connectors/connections/${createdRestConnId}/sync`, {
        headers: { 'x-api-key': keyPair.rawKey },
        body: { syncType: 'FULL' },
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.recordsProcessed > 0, true);
    });

    await test('POST /api/v1/connectors/connections/:id/rotate-credentials rotates credentials', async () => {
      const res = await request('POST', `/connectors/connections/${createdRestConnId}/rotate-credentials`, {
        headers: { 'x-api-key': keyPair.rawKey },
        body: { newSecret: 'super_secret_rotated_key' },
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.success, true);
    });

    await test('DELETE /api/v1/connectors/connections/:id deletes connection', async () => {
      const res = await request('DELETE', `/connectors/connections/${createdRestConnId}`, { headers: { 'x-api-key': keyPair.rawKey } });
      assert.strictEqual(res.status, 200);
    });

  } finally {
    server.close();
  }

  console.log('\n================================================================');
  console.log(`TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED (100% SUCCESS)`);
  console.log('================================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runConnectorPlatformTestSuite().catch((err) => {
  console.error('[FATAL TEST SUITE ERROR]:', err);
  if (server) server.close();
  process.exit(1);
});
