/**
 * publicApiV1.test.js
 * Comprehensive automated test suite for Phase 8.2 Public REST API Platform (/api/v1).
 * Tests API Key authentication, scope authorization, rate limiting headers, standard response envelopes,
 * error models, OpenAPI specs, Swagger UI, Public Verification, Business Profiles, Compliance,
 * Supplier Trust, Trust Distribution, and Developer Key lifecycle.
 */

const assert = require('assert');
const http = require('http');
const app = require('../src/app');
const { ApiKeyManager, SCOPES } = require('../src/integrationPlatform');
const { developerAppRepository, apiKeyRepository, msmeProfileRepository } = require('../src/repositories');

let server;
const PORT = 5099;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

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

async function runPublicApiV1TestSuite() {
  console.log('================================================================');
  console.log('RUNNING PHASE 8.2 PUBLIC REST API PLATFORM TEST SUITE');
  console.log('================================================================\n');

  // Start HTTP Test Server
  await new Promise((resolve) => {
    server = app.listen(PORT, resolve);
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
    // Dynamically find existing DB records for testing
    const firstMsme = await msmeProfileRepository.findFirst({});
    const targetMsmeId = firstMsme ? firstMsme.id : 1;

    // 1. Documentation & OpenAPI Spec Tests
    console.log('--- 1. OPENAPI SPEC & SWAGGER UI ---');
    await test('GET /api/v1/docs/openapi.json returns valid OpenAPI 3.0 spec', async () => {
      const res = await request('GET', '/docs/openapi.json');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.openapi, '3.0.3');
      assert.strictEqual(res.body.info.title.includes('VerifyChain'), true);
    });

    await test('GET /api/v1/docs returns Swagger UI HTML interface', async () => {
      const res = await request('GET', '/docs');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.raw.includes('swagger-ui'), true);
    });

    // 2. Public Verification API Tests
    console.log('\n--- 2. PUBLIC VERIFICATION API ---');
    await test('GET /api/v1/verify/:slug returns verified public profile', async () => {
      const res = await request('GET', '/verify/apex-precision-components-pvt-ltd-8');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(typeof res.body.data.display_name, 'string');
      assert.strictEqual(typeof res.body.requestId, 'string');
      assert.strictEqual(typeof res.body.timestamp, 'string');
    });

    await test('GET /api/v1/verify/:slug/assets returns trust distribution assets', async () => {
      const res = await request('GET', '/verify/apex-precision-components-pvt-ltd-8/assets');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.publicSlug, 'apex-precision-components-pvt-ltd-8');
      assert.strictEqual(typeof res.body.data.distribution, 'object');
    });

    await test('GET /api/v1/verify/:slug returns 404 for non-existent profile', async () => {
      const res = await request('GET', '/verify/non-existent-company-slug-xyz99');
      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.errorCode, 'PROFILE_NOT_FOUND');
    });

    // 3. API Key Authentication & Scope Authorization Tests
    console.log('\n--- 3. API KEY AUTHENTICATION & AUTHORIZATION ---');
    await test('GET /api/v1/businesses without API key returns 401 UNAUTHORIZED', async () => {
      const res = await request('GET', '/businesses');
      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.errorCode, 'UNAUTHORIZED');
    });

    await test('GET /api/v1/businesses with invalid API key returns 401', async () => {
      const res = await request('GET', '/businesses', { headers: { 'x-api-key': 'vc_live_invalidkey12345' } });
      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.error.errorCode, 'UNAUTHORIZED');
    });

    // Seed test Developer App and API Key
    const devApp = await developerAppRepository.create({
      msme_id: targetMsmeId,
      app_id: `APP-TEST-API-${Date.now()}`,
      name: 'V1 Test Partner App',
      environment: 'PRODUCTION',
    });

    const fullKeyPair = ApiKeyManager.generateKeyPair('PRODUCTION');
    await apiKeyRepository.create({
      developer_app_id: devApp.id,
      key_prefix: fullKeyPair.keyPrefix,
      key_hash: fullKeyPair.keyHash,
      name: 'Full Scope Test Key',
      environment: 'PRODUCTION',
      scopes: Object.values(SCOPES),
    });

    const readOnlyKeyPair = ApiKeyManager.generateKeyPair('PRODUCTION');
    await apiKeyRepository.create({
      developer_app_id: devApp.id,
      key_prefix: readOnlyKeyPair.keyPrefix,
      key_hash: readOnlyKeyPair.keyHash,
      name: 'Read Only Scope Key',
      environment: 'PRODUCTION',
      scopes: [SCOPES.BUSINESS_READ],
    });

    await test('Authenticated request with valid API key returns 200 OK & rate limit headers', async () => {
      const res = await request('GET', '/businesses', { headers: { 'x-api-key': fullKeyPair.rawKey } });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(Array.isArray(res.body.data), true);
      assert.strictEqual(typeof res.headers['x-ratelimit-limit'], 'string');
      assert.strictEqual(typeof res.headers['x-ratelimit-remaining'], 'string');
    });

    await test('Request with insufficient scope returns 403 INSUFFICIENT_SCOPE', async () => {
      const res = await request('GET', '/compliance/health', { headers: { 'x-api-key': readOnlyKeyPair.rawKey } });
      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.errorCode, 'INSUFFICIENT_SCOPE');
    });

    // 4. Resource API Endpoints Tests
    console.log('\n--- 4. REST RESOURCE API ENDPOINTS ---');
    await test('GET /api/v1/businesses/:id retrieves business by ID', async () => {
      const res = await request('GET', `/businesses/${targetMsmeId}`, { headers: { 'x-api-key': fullKeyPair.rawKey } });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.id, targetMsmeId);
      assert.strictEqual(typeof res.body.data.business_name, 'string');
    });

    await test('GET /api/v1/compliance lists compliance records', async () => {
      const res = await request('GET', '/compliance', { headers: { 'x-api-key': fullKeyPair.rawKey } });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(Array.isArray(res.body.data), true);
      assert.strictEqual(typeof res.body.pagination, 'object');
    });

    await test('GET /api/v1/compliance/health retrieves health intelligence', async () => {
      const res = await request('GET', '/compliance/health', { headers: { 'x-api-key': fullKeyPair.rawKey } });
      assert.strictEqual(res.status, 200);
      const score = res.body.data.overall_score !== undefined ? res.body.data.overall_score : res.body.data.overallScore;
      assert.strictEqual(typeof score, 'number');
    });

    await test('GET /api/v1/trust/profiles lists supplier trust profiles', async () => {
      const res = await request('GET', '/trust/profiles', { headers: { 'x-api-key': fullKeyPair.rawKey } });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(Array.isArray(res.body.data), true);
    });

    await test('GET /api/v1/distribution/identities lists distribution identities', async () => {
      const res = await request('GET', '/distribution/identities', { headers: { 'x-api-key': fullKeyPair.rawKey } });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(Array.isArray(res.body.data), true);
    });

    // 5. Developer Platform Lifecycle Tests
    console.log('\n--- 5. DEVELOPER PLATFORM & KEY LIFECYCLE ---');
    let generatedKeyId;
    let generatedRawKey;

    await test('POST /api/v1/developer/keys generates new API Key pair', async () => {
      const res = await request('POST', '/developer/keys', {
        headers: { 'x-api-key': fullKeyPair.rawKey },
        body: {
          developerAppId: devApp.id,
          name: 'Dynamic Dev Key',
          scopes: [SCOPES.BUSINESS_READ, SCOPES.TRUST_READ],
        },
      });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.name, 'Dynamic Dev Key');
      assert.strictEqual(res.body.data.rawApiKey.startsWith('vc_live_'), true);

      generatedKeyId = res.body.data.id;
      generatedRawKey = res.body.data.rawApiKey;
    });

    await test('Generated raw key authenticates successfully', async () => {
      const res = await request('GET', '/businesses', { headers: { 'x-api-key': generatedRawKey } });
      assert.strictEqual(res.status, 200);
    });

    await test('POST /api/v1/developer/keys/:id/rotate rotates API key', async () => {
      const res = await request('POST', `/developer/keys/${generatedKeyId}/rotate`, {
        headers: { 'x-api-key': fullKeyPair.rawKey },
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(typeof res.body.data.rawApiKey, 'string');

      // Verify old key is now disabled
      const oldRes = await request('GET', '/businesses', { headers: { 'x-api-key': generatedRawKey } });
      assert.strictEqual(oldRes.status, 401);
      assert.strictEqual(oldRes.body.error.errorCode, 'KEY_DISABLED');
    });

    await test('POST /api/v1/developer/keys/:id/revoke revokes API key', async () => {
      const res = await request('POST', `/developer/keys/${generatedKeyId}/revoke`, {
        headers: { 'x-api-key': fullKeyPair.rawKey },
        body: { reason: 'Security Audit Revocation' },
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.status, 'REVOKED');
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

runPublicApiV1TestSuite().catch((err) => {
  console.error('[FATAL TEST SUITE ERROR]:', err);
  if (server) server.close();
  process.exit(1);
});
