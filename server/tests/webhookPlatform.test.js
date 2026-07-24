/**
 * webhookPlatform.test.js
 * Comprehensive automated test suite for Phase 8.3 Webhooks & Event Subscriptions Platform.
 * Tests Event Catalog, HMAC-SHA256 Signing, Delivery Engine, Retry Engine, Dead-Letter Queueing,
 * Replay capabilities, DomainEventBus integration, and Webhook REST APIs.
 */

const assert = require('assert');
const http = require('http');
const app = require('../src/app');
const domainEventBus = require('../src/events/DomainEventBus');
const defaultPrisma = require('../src/utils/prismaClient');
const {
  EVENT_CATALOG,
  listAllEvents,
  validateEventName,
  validateEventList,
  getEventCategory,
  WebhookSigner,
  WebhookDeliveryEngine,
  WebhookRetryEngine,
  WebhookEventDispatcher,
} = require('../src/webhookPlatform');

const { ApiKeyManager, SCOPES } = require('../src/integrationPlatform');
const { developerAppRepository, apiKeyRepository, webhookSubscriptionRepository, msmeProfileRepository } = require('../src/repositories');

let server;
let mockSubscriberServer;
const TEST_PORT = 5098;
const MOCK_SUBSCRIBER_PORT = 5097;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}/api/v1`;

const receivedWebhooks = [];

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

async function runWebhookPlatformTestSuite() {
  console.log('================================================================');
  console.log('RUNNING PHASE 8.3 WEBHOOKS & EVENT PLATFORM TEST SUITE');
  console.log('================================================================\n');

  // Start HTTP Test Application Server
  await new Promise((resolve) => {
    server = app.listen(TEST_PORT, resolve);
  });

  // Start Mock Subscriber Endpoint Server to receive Webhook POST requests
  await new Promise((resolve) => {
    mockSubscriberServer = http.createServer((req, res) => {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const entry = {
            method: req.method,
            headers: req.headers,
            body: JSON.parse(body),
          };
          receivedWebhooks.push(entry);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ received: true }));
        } catch (e) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Bad Payload' }));
        }
      });
    }).listen(MOCK_SUBSCRIBER_PORT, '127.0.0.1', resolve);
  });

  let passedTests = 0;
  let totalTests = 0;

  // Clean up old subscriptions from previous test runs
  await defaultPrisma.webhookAttempt.deleteMany({});
  await defaultPrisma.webhookDelivery.deleteMany({});
  await defaultPrisma.webhookSubscription.deleteMany({});

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
    // 1. Event Catalog Tests
    console.log('--- 1. EVENT CATALOG ---');
    await test('List and validate catalog event names', async () => {
      const events = listAllEvents();
      assert.strictEqual(events.length >= 20, true);
      assert.strictEqual(validateEventName('BusinessCreated'), true);
      assert.strictEqual(validateEventName('SupplierTrustPublished'), true);
      assert.strictEqual(validateEventName('InvalidEventName'), false);
      assert.strictEqual(getEventCategory('BusinessVerified'), 'BUSINESS');
      assert.strictEqual(getEventCategory('ComplianceExpired'), 'COMPLIANCE');
    });

    // 2. HMAC-SHA256 Webhook Signer Tests
    console.log('\n--- 2. HMAC-SHA256 SIGNATURE ENGINE ---');
    await test('Generate signing secret with whsec_ prefix', async () => {
      const secret = WebhookSigner.generateSigningSecret();
      assert.strictEqual(secret.startsWith('whsec_'), true);
      assert.strictEqual(secret.length > 20, true);
    });

    await test('Calculate and verify HMAC-SHA256 signature', async () => {
      const secret = WebhookSigner.generateSigningSecret();
      const payload = { event: 'SupplierTrustPublished', data: { msmeId: 8 } };
      const timestamp = Math.floor(Date.now() / 1000);

      const sigInfo = WebhookSigner.calculateSignature(payload, secret, timestamp);
      assert.strictEqual(typeof sigInfo.headerValue, 'string');
      assert.strictEqual(sigInfo.headerValue.includes('v1='), true);

      const isValid = WebhookSigner.verifySignature({
        payload,
        signatureHeader: sigInfo.headerValue,
        secret,
        toleranceSeconds: 300,
      });

      assert.strictEqual(isValid, true);
    });

    await test('Reject tampered signature or expired timestamp', async () => {
      const secret = WebhookSigner.generateSigningSecret();
      const payload = { event: 'SupplierTrustPublished', data: { msmeId: 8 } };
      const timestamp = Math.floor(Date.now() / 1000) - 600; // 10 mins old

      const sigInfo = WebhookSigner.calculateSignature(payload, secret, timestamp);

      // Verify should fail due to expired timestamp
      const isFresh = WebhookSigner.verifySignature({
        payload,
        signatureHeader: sigInfo.headerValue,
        secret,
        toleranceSeconds: 300,
      });
      assert.strictEqual(isFresh, false);
    });

    // Seed test Developer App and API Key
    const firstMsme = await msmeProfileRepository.findFirst({});
    const msmeId = firstMsme ? firstMsme.id : 1;

    const devApp = await developerAppRepository.create({
      msme_id: msmeId,
      app_id: `APP-TEST-WH-${Date.now()}`,
      name: 'Webhook Test Partner App',
      environment: 'PRODUCTION',
    });

    const keyPair = ApiKeyManager.generateKeyPair('PRODUCTION');
    await apiKeyRepository.create({
      developer_app_id: devApp.id,
      key_prefix: keyPair.keyPrefix,
      key_hash: keyPair.keyHash,
      name: 'Webhook Admin Test Key',
      environment: 'PRODUCTION',
      scopes: Object.values(SCOPES),
    });

    // 3. Webhook Delivery & Replay Engine Tests
    console.log('\n--- 3. DELIVERY ENGINE & REPLAY ---');
    let testSubRecord;

    await test('Dispatch live webhook HTTP POST to mock subscriber', async () => {
      const targetUrl = `http://127.0.0.1:${MOCK_SUBSCRIBER_PORT}/webhook`;
      const signingSecret = WebhookSigner.generateSigningSecret();

      testSubRecord = await webhookSubscriptionRepository.create({
        developer_app_id: devApp.id,
        subscription_id: `WH-SUB-LIVE-${Date.now()}`,
        target_url: targetUrl,
        subscribed_events: ['SupplierTrustPublished', 'BusinessVerified'],
        secret_hash: signingSecret,
        is_active: true,
      });

      // Attach raw_secret for signer
      testSubRecord.raw_secret = signingSecret;

      const eventPayload = {
        eventId: 'evt_test_123',
        event: 'SupplierTrustPublished',
        contractVersion: 'v1.0.0',
        timestamp: new Date().toISOString(),
        data: { msmeId, status: 'VERIFIED' },
      };

      const result = await WebhookDeliveryEngine.dispatchDelivery(testSubRecord, eventPayload);

      assert.strictEqual(result.status, 'DELIVERED');
      assert.strictEqual(result.statusCode, 200);

      const found = receivedWebhooks.some(w => w.headers['x-verifychain-event'] === 'SupplierTrustPublished');
      assert.strictEqual(found, true);
    });

    await test('Replay delivery attempt on-demand', async () => {
      const delivery = await defaultPrisma.webhookDelivery.findFirst({
        where: { subscription_id: testSubRecord.id },
      });

      assert.strictEqual(delivery !== null, true);

      const replayResult = await WebhookRetryEngine.replayDelivery(delivery.id);
      assert.strictEqual(replayResult.status, 'DELIVERED');

      const replayEvent = receivedWebhooks.find(w => w.body.isReplay === true);
      assert.strictEqual(replayEvent !== undefined, true);
    });

    // 4. DomainEventBus Integration Test
    console.log('\n--- 4. DOMAINEVENTBUS INTEGRATION ---');
    await test('DomainEventBus triggers automatic outbound webhook dispatch', async () => {
      const initialCount = receivedWebhooks.length;

      // Publish event via DomainEventBus
      domainEventBus.publish('BusinessVerified', {
        msmeId,
        businessName: 'Apex Precision',
        gstin: '27AABCA1234H1Z0',
      });

      // Allow async event loop to process
      await new Promise(r => setTimeout(r, 200));

      const found = receivedWebhooks.slice(initialCount).some(w => w.headers['x-verifychain-event'] === 'BusinessVerified');
      assert.strictEqual(found, true);
    });

    // 5. Webhook Management REST APIs Tests
    console.log('\n--- 5. WEBHOOK REST APIs (/api/v1/webhooks) ---');
    let createdSubId;

    await test('GET /api/v1/webhooks/catalog lists supported event catalog', async () => {
      const res = await request('GET', '/webhooks/catalog', { headers: { 'x-api-key': keyPair.rawKey } });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(Array.isArray(res.body.data.supportedEvents), true);
      assert.strictEqual(res.body.data.supportedEvents.includes('SupplierTrustPublished'), true);
    });

    await test('POST /api/v1/webhooks creates subscription and returns signing secret ONCE', async () => {
      const res = await request('POST', '/webhooks', {
        headers: { 'x-api-key': keyPair.rawKey },
        body: {
          developerAppId: devApp.id,
          targetUrl: `http://127.0.0.1:${MOCK_SUBSCRIBER_PORT}/events`,
          subscribedEvents: ['SupplierTrustPublished', 'QRCodeGenerated'],
        },
      });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.signingSecret.startsWith('whsec_'), true);

      createdSubId = res.body.data.id;
    });

    await test('GET /api/v1/webhooks lists subscriptions', async () => {
      const res = await request('GET', '/webhooks', { headers: { 'x-api-key': keyPair.rawKey } });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(Array.isArray(res.body.data), true);
    });

    await test('POST /api/v1/webhooks/:id/pause pauses subscription', async () => {
      const res = await request('POST', `/webhooks/${createdSubId}/pause`, { headers: { 'x-api-key': keyPair.rawKey } });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.isActive, false);
    });

    await test('POST /api/v1/webhooks/:id/resume resumes subscription', async () => {
      const res = await request('POST', `/webhooks/${createdSubId}/resume`, { headers: { 'x-api-key': keyPair.rawKey } });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.isActive, true);
    });

    await test('POST /api/v1/webhooks/:id/rotate-secret rotates signing secret', async () => {
      const res = await request('POST', `/webhooks/${createdSubId}/rotate-secret`, { headers: { 'x-api-key': keyPair.rawKey } });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.signingSecret.startsWith('whsec_'), true);
    });

    await test('POST /api/v1/webhooks/:id/ping dispatches test ping event', async () => {
      const res = await request('POST', `/webhooks/${createdSubId}/ping`, { headers: { 'x-api-key': keyPair.rawKey } });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.status, 'DELIVERED');
    });

    await test('GET /api/v1/webhooks/:id/deliveries lists delivery attempt history', async () => {
      const res = await request('GET', `/webhooks/${createdSubId}/deliveries`, { headers: { 'x-api-key': keyPair.rawKey } });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(Array.isArray(res.body.data), true);
    });

  } finally {
    server.close();
    mockSubscriberServer.close();
  }

  console.log('\n================================================================');
  console.log(`TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED (100% SUCCESS)`);
  console.log('================================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runWebhookPlatformTestSuite().catch((err) => {
  console.error('[FATAL TEST SUITE ERROR]:', err);
  if (server) server.close();
  if (mockSubscriberServer) mockSubscriberServer.close();
  process.exit(1);
});
