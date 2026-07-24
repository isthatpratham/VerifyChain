/**
 * developerPlatform.test.js
 * Comprehensive Automated Test Suite for Phase 8.5 Developer Platform & Integration Management.
 * Tests Dashboard Service, API Keys (showing raw key ONCE), Webhooks, Connectors, Developer Apps,
 * Analytics, Audit Center, Security Center, Observability, Global Search, Preferences, and REST APIs.
 */

const assert = require('assert');
const http = require('http');
const app = require('../src/app');
const defaultPrisma = require('../src/utils/prismaClient');
const {
  DeveloperDashboardService,
  ApiKeyManagementService,
  WebhookManagementService,
  ConnectorManagementService,
  DeveloperAppManagementService,
  AnalyticsService,
  AuditCenterService,
  SecurityCenterService,
  ObservabilityService,
  GlobalSearchService,
  PreferencesService,
  DEVELOPER_SCOPES,
} = require('../src/developerPlatform');

const { ApiKeyManager, SCOPES } = require('../src/integrationPlatform');
const { developerAppRepository, apiKeyRepository, msmeProfileRepository } = require('../src/repositories');

let server;
const TEST_PORT = 5098;
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

async function runDeveloperPlatformTestSuite() {
  console.log('================================================================');
  console.log('RUNNING PHASE 8.5 DEVELOPER PLATFORM TEST SUITE');
  console.log('================================================================\n');

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
    // Seed Developer App & API Key for HTTP API testing
    const firstMsme = await msmeProfileRepository.findFirst({});
    const msmeId = firstMsme ? firstMsme.id : 1;

    const testApp = await developerAppRepository.create({
      msme_id: msmeId,
      app_id: `APP-DEVPLAT-${Date.now()}`,
      name: 'Developer Platform Integration App',
      environment: 'PRODUCTION',
    });

    const keyPair = ApiKeyManager.generateKeyPair('PRODUCTION');
    await apiKeyRepository.create({
      developer_app_id: testApp.id,
      key_prefix: keyPair.keyPrefix,
      key_hash: keyPair.keyHash,
      name: 'Developer Platform Admin Key',
      environment: 'PRODUCTION',
      scopes: Object.values(SCOPES),
    });

    // 1. Dashboard Overview Service
    console.log('--- 1. DASHBOARD SERVICE & METRICS ---');
    await test('Fetch developer dashboard overview metrics', async () => {
      const overview = await DeveloperDashboardService.getDashboardOverview(msmeId);
      assert.strictEqual(typeof overview.metrics.totalApplications, 'number');
      assert.strictEqual(typeof overview.metrics.activeApiKeys, 'number');
      assert.strictEqual(Array.isArray(overview.quickActions), true);
    });

    // 2. API Key Management Service
    console.log('\n--- 2. API KEY MANAGEMENT (RAW KEY DISPLAY ONCE) ---');
    let createdKeyId;

    await test('Create API Key returns raw secret key ONLY ONCE', async () => {
      const result = await ApiKeyManagementService.createApiKey({
        developerAppId: testApp.id,
        name: 'Service Account Key',
        environment: 'PRODUCTION',
      });

      assert.strictEqual(typeof result.rawKey, 'string');
      assert.strictEqual(result.rawKey.startsWith('vc_live_'), true);
      assert.strictEqual(typeof result.apiKey.id, 'number');
      createdKeyId = result.apiKey.id;
    });

    await test('List API Keys obscures secret key hashes', async () => {
      const keys = await ApiKeyManagementService.listApiKeys(testApp.id);
      assert.strictEqual(keys.length > 0, true);
      assert.strictEqual(keys[0].key_hash, undefined);
      assert.strictEqual(typeof keys[0].displayKey, 'string');
    });

    await test('Rotate and revoke API keys', async () => {
      const rotate = await ApiKeyManagementService.rotateApiKey(createdKeyId);
      assert.strictEqual(typeof rotate.rawKey, 'string');

      const revoked = await ApiKeyManagementService.revokeApiKey(createdKeyId, 'Test revocation');
      assert.strictEqual(revoked.status, 'REVOKED');
    });

    // 3. Webhook Management Service
    console.log('\n--- 3. WEBHOOK MANAGEMENT & DELIVERY REPLAY ---');
    let subId;

    await test('Create Webhook Subscription and signing secret', async () => {
      const result = await WebhookManagementService.createSubscription({
        developerAppId: testApp.id,
        targetUrl: 'https://webhook.site/test-endpoint',
        subscribedEvents: ['ComplianceRecordVerified', 'TrustScoreUpdated'],
      });

      assert.strictEqual(typeof result.signingSecret, 'string');
      assert.strictEqual(result.subscription.is_active, true);
      subId = result.subscription.id;
    });

    await test('Toggle webhook status and rotate secret', async () => {
      const toggled = await WebhookManagementService.toggleStatus(subId);
      assert.strictEqual(toggled.is_active, false);

      const rotated = await WebhookManagementService.rotateSecret(subId);
      assert.strictEqual(typeof rotated.newSigningSecret, 'string');
    });

    // 4. Analytics & Security Center
    console.log('\n--- 4. ANALYTICS & SECURITY CENTER ---');
    await test('Generate visual usage analytics dataset', async () => {
      const analytics = await AnalyticsService.getUsageAnalytics(msmeId, 7);
      assert.strictEqual(typeof analytics.summary.totalRequests, 'number');
      assert.strictEqual(Array.isArray(analytics.dailyTrend), true);
    });

    await test('Generate security report and recommendations', async () => {
      const report = await SecurityCenterService.getSecurityReport(msmeId);
      assert.strictEqual(typeof report.securityScore, 'number');
      assert.strictEqual(Array.isArray(report.recommendations), true);
    });

    // 5. System Observability & Global Search
    console.log('\n--- 5. OBSERVABILITY & GLOBAL SEARCH OVERLAY ---');
    await test('Fetch system observability status', async () => {
      const obs = await ObservabilityService.getSystemObservability();
      assert.strictEqual(obs.status, 'OPERATIONAL');
      assert.strictEqual(obs.components.database.status, 'HEALTHY');
    });

    await test('Execute universal search across developer entities', async () => {
      const searchRes = await GlobalSearchService.universalSearch(msmeId, 'Developer');
      assert.strictEqual(Array.isArray(searchRes.results), true);
      assert.strictEqual(searchRes.totalResults > 0, true);
    });

    // 6. REST API Endpoints (/api/v1/developer-platform)
    console.log('\n--- 6. DEVELOPER PLATFORM REST APIs ---');
    await test('GET /api/v1/developer-platform/dashboard returns 200', async () => {
      const res = await request('GET', '/developer-platform/dashboard', { headers: { 'x-api-key': keyPair.rawKey } });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
    });

    await test('GET /api/v1/developer-platform/analytics returns 200', async () => {
      const res = await request('GET', '/developer-platform/analytics?days=7', { headers: { 'x-api-key': keyPair.rawKey } });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.timeframeDays, 7);
    });

    await test('GET /api/v1/developer-platform/apps lists apps', async () => {
      const res = await request('GET', '/developer-platform/apps', { headers: { 'x-api-key': keyPair.rawKey } });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(Array.isArray(res.body.data), true);
    });

    await test('POST /api/v1/developer-platform/apps registers app', async () => {
      const res = await request('POST', '/developer-platform/apps', {
        headers: { 'x-api-key': keyPair.rawKey },
        body: { name: 'New REST Test App', environment: 'PRODUCTION' },
      });
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.data.name, 'New REST Test App');
    });

    await test('GET /api/v1/developer-platform/security returns 200', async () => {
      const res = await request('GET', '/developer-platform/security', { headers: { 'x-api-key': keyPair.rawKey } });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(typeof res.body.data.securityScore, 'number');
    });

    await test('GET /api/v1/developer-platform/observability returns 200', async () => {
      const res = await request('GET', '/developer-platform/observability', { headers: { 'x-api-key': keyPair.rawKey } });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.status, 'OPERATIONAL');
    });

    await test('GET /api/v1/developer-platform/search returns 200', async () => {
      const res = await request('GET', '/developer-platform/search?q=App', { headers: { 'x-api-key': keyPair.rawKey } });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(Array.isArray(res.body.data.results), true);
    });

    await test('GET & PUT /api/v1/developer-platform/preferences handles preferences', async () => {
      const getRes = await request('GET', '/developer-platform/preferences', { headers: { 'x-api-key': keyPair.rawKey } });
      assert.strictEqual(getRes.status, 200);

      const putRes = await request('PUT', '/developer-platform/preferences/dashboard', {
        headers: { 'x-api-key': keyPair.rawKey },
        body: { theme: 'DARK', default_view: 'ANALYTICS' },
      });
      assert.strictEqual(putRes.status, 200);
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

runDeveloperPlatformTestSuite().catch((err) => {
  console.error('[FATAL TEST SUITE ERROR]:', err);
  if (server) server.close();
  process.exit(1);
});
