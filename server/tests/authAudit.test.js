/**
 * authAudit.test.js
 * Comprehensive Authentication & Authorization Audit Test Suite for Phase 9 AI Ecosystem.
 * Verifies 401 for unauthenticated/invalid requests and 200 OK for authenticated authorized requests.
 */

const assert = require('assert');
const http = require('http');
const app = require('../src/app');
const { generateToken } = require('../src/utils/jwt');
const { userRepository, msmeProfileRepository } = require('../src/repositories');

function makeRequest(serverUrl, { method = 'GET', path = '/', headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, serverUrl);
    const options = {
      method: method.toUpperCase(),
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        let json = {};
        try {
          json = JSON.parse(data);
        } catch (_) {}
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runAuthAuditTests() {
  console.log('=== STARTING AUTHENTICATION & AUTHORIZATION AUDIT (PHASE 9) ===\n');

  // Start test server
  const server = app.listen(0);
  const port = server.address().port;
  const serverUrl = `http://localhost:${port}`;

  try {
    // 1. Create / Retrieve Test User and JWT Token
    console.log('[Test 1] Generating Test User & JWT Token...');
    let user = await userRepository.findByEmail('auditor@verifychain.com');
    if (!user) {
      user = await userRepository.create({
        email: 'auditor@verifychain.com',
        password_hash: '$2b$10$e8w.R8k6rLd8hJg1O.6x4.u3nL/Yw3v9d9o4m5s6t7u8v9w0',
        name: 'AI Auditor',
        role: 'ADMIN',
        is_active: true,
      });
    }

    let msme = await msmeProfileRepository.findByUserId(user.id);
    if (!msme) {
      msme = await msmeProfileRepository.create({
        user_id: user.id,
        business_name: 'Audit Tech Corp',
        business_type: 'SERVICES',
        gstin: '27AAAAA0000A1Z5',
        udyam_number: 'UDYAM-MH-00-0000000',
        sector: 'TECHNOLOGY',
        state: 'MAHARASHTRA',
        district: 'MUMBAI',
      });
    }

    const validJwt = generateToken({ id: user.id, email: user.email, role: user.role });
    assert.ok(validJwt, 'Valid JWT generated');
    console.log('✔ Test User & JWT Token ready.');

    // 2. Audit Unauthenticated Behavior (Must return 401, NOT 403)
    console.log('\n[Test 2] Auditing Unauthenticated Requests (Expecting 401)...');

    const unauthEndpoints = [
      { method: 'GET', path: '/api/v1/ai-compliance/executive-summary' },
      { method: 'GET', path: '/api/v1/ai-compliance/recommendations' },
      { method: 'GET', path: '/api/v1/document-intelligence/documents' },
      { method: 'GET', path: '/api/v1/ai-assistant/conversations' },
      { method: 'GET', path: '/api/v1/predictive-intelligence/early-warnings' },
      { method: 'GET', path: '/api/v1/ai-governance/health-grid' },
    ];

    for (const ep of unauthEndpoints) {
      const res = await makeRequest(serverUrl, { method: ep.method, path: ep.path });
      assert.strictEqual(res.status, 401, `Unauthenticated request to ${ep.path} must return 401 (Got ${res.status})`);
      assert.strictEqual(res.body.error?.errorCode, 'UNAUTHORIZED', 'ErrorCode must be UNAUTHORIZED');
    }
    console.log('✔ Unauthenticated requests correctly return 401 Unauthorized.');

    // 3. Audit Authenticated Phase 9 AI Endpoints (Expecting 200 OK)
    console.log('\n[Test 3] Auditing Authenticated Requests with Valid JWT (Expecting 200 OK)...');

    const authEndpoints = [
      // AI Compliance
      { method: 'GET', path: '/api/v1/ai-compliance/executive-summary' },
      { method: 'GET', path: '/api/v1/ai-compliance/recommendations' },
      { method: 'GET', path: '/api/v1/ai-compliance/risks' },
      { method: 'GET', path: '/api/v1/ai-compliance/gaps' },
      { method: 'GET', path: '/api/v1/ai-compliance/action-plans' },
      { method: 'POST', path: '/api/v1/ai-compliance/analyze', body: {} },

      // Document Intelligence
      { method: 'GET', path: '/api/v1/document-intelligence/documents' },

      // AI Assistant
      { method: 'GET', path: '/api/v1/ai-assistant/conversations' },
      { method: 'POST', path: '/api/v1/ai-assistant/conversations/messages', body: { query: 'Explain trust score' } },
      { method: 'POST', path: '/api/v1/ai-assistant/reports/generate', body: { reportType: 'BOARD_REPORT' } },

      // Predictive Intelligence
      { method: 'POST', path: '/api/v1/predictive-intelligence/forecast', body: {} },
      { method: 'GET', path: '/api/v1/predictive-intelligence/trends' },
      { method: 'GET', path: '/api/v1/predictive-intelligence/early-warnings' },
      { method: 'POST', path: '/api/v1/predictive-intelligence/simulate', body: { scenarioType: 'GST_DELAY' } },

      // AI Governance
      { method: 'GET', path: '/api/v1/ai-governance/health-grid' },
      { method: 'GET', path: '/api/v1/ai-governance/cost-analytics' },
      { method: 'GET', path: '/api/v1/ai-governance/evaluations' },
      { method: 'GET', path: '/api/v1/ai-governance/approvals' },
    ];

    for (const ep of authEndpoints) {
      const res = await makeRequest(serverUrl, {
        method: ep.method,
        path: ep.path,
        headers: { Authorization: `Bearer ${validJwt}` },
        body: ep.body,
      });

      assert.strictEqual(res.status, 200, `Authenticated request to ${ep.path} failed with status ${res.status} (${JSON.stringify(res.body)})`);
      assert.ok(res.body.success, `Response for ${ep.path} must indicate success: true`);
    }

    console.log(`✔ All ${authEndpoints.length} Phase 9 endpoints authenticated and authorized cleanly (200 OK).`);

    console.log('\n=== AUTHENTICATION & AUTHORIZATION AUDIT PASSED ALL VERIFICATIONS ===');
  } catch (err) {
    console.error('\n❌ AUTHENTICATION & AUTHORIZATION AUDIT FAILED:', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

runAuthAuditTests();
