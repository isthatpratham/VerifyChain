/**
 * runAllTests.js
 * Master Test Suite Runner — Phase 8.6 Production Hardening.
 * Executes every automated test suite across the VerifyChain platform,
 * validates health probes, cache, metrics, and circuit breaker infrastructure,
 * and produces a consolidated pass/fail report.
 */

const assert = require('assert');
const http = require('http');
const app = require('../src/app');
const CacheManager = require('../src/utils/CacheManager');
const MetricsCollector = require('../src/observability/MetricsCollector');
const CircuitBreaker = require('../src/observability/CircuitBreaker');

let server;
const TEST_PORT = 5099;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

function httpGet(path) {
  return new Promise((resolve, reject) => {
    http.get(`${BASE_URL}${path}`, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    }).on('error', reject);
  });
}

async function runProductionHardeningTests() {
  console.log('================================================================');
  console.log('PHASE 8.6 — PRODUCTION HARDENING MASTER TEST SUITE');
  console.log('================================================================\n');

  await new Promise((resolve) => {
    server = app.listen(TEST_PORT, resolve);
  });

  let passed = 0;
  let total = 0;

  async function test(description, fn) {
    total++;
    try {
      await fn();
      console.log(`  [PASS] ${description}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] ${description}: ${err.message}`);
    }
  }

  try {
    // ─── 1. HEALTH, LIVENESS & READINESS PROBES ──────────────────────────────
    console.log('\n--- 1. HEALTH, LIVENESS & READINESS PROBES ---');

    await test('GET /health/liveness returns 200 with status UP', async () => {
      const res = await httpGet('/health/liveness');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.status, 'UP');
      assert.strictEqual(typeof res.body.uptime, 'number');
    });

    await test('GET /health/readiness returns 200 with database HEALTHY', async () => {
      const res = await httpGet('/health/readiness');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.checks.database, 'HEALTHY');
    });

    await test('GET /health/metrics returns memory and cache metrics', async () => {
      const res = await httpGet('/health/metrics');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(typeof res.body.memory.rssBytes, 'number');
      assert.strictEqual(typeof res.body.cache.hitRatioPercent, 'number');
      assert.strictEqual(res.body.node.version, process.version);
    });

    await test('Legacy GET /api/health preserved', async () => {
      const res = await httpGet('/api/health');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
    });

    // ─── 2. SECURITY HEADERS ─────────────────────────────────────────────────
    console.log('\n--- 2. SECURITY HEADERS ---');

    await test('Response includes X-Content-Type-Options: nosniff', async () => {
      const res = await httpGet('/health/liveness');
      assert.strictEqual(res.headers['x-content-type-options'], 'nosniff');
    });

    await test('Response includes X-Frame-Options', async () => {
      const res = await httpGet('/health/liveness');
      assert.ok(res.headers['x-frame-options']);
    });

    await test('Response includes Strict-Transport-Security', async () => {
      const res = await httpGet('/health/liveness');
      assert.ok(res.headers['strict-transport-security']);
    });

    await test('X-Powered-By header is removed', async () => {
      const res = await httpGet('/health/liveness');
      assert.strictEqual(res.headers['x-powered-by'], undefined);
    });

    // ─── 3. CACHE MANAGER ────────────────────────────────────────────────────
    console.log('\n--- 3. CACHE MANAGER ---');

    await test('CacheManager set and get works', () => {
      CacheManager.set('test:key', { data: 'value' }, 5000);
      const result = CacheManager.get('test:key');
      assert.deepStrictEqual(result, { data: 'value' });
    });

    await test('CacheManager returns null for expired entries', () => {
      CacheManager.set('test:expired', 'val', 1); // 1ms TTL
      // Wait a moment
      const start = Date.now();
      while (Date.now() - start < 5) {} // Busy wait 5ms
      const result = CacheManager.get('test:expired');
      assert.strictEqual(result, null);
    });

    await test('CacheManager tracks hit/miss metrics', () => {
      CacheManager.clear();
      CacheManager.set('test:hit', 'v');
      CacheManager.get('test:hit'); // hit
      CacheManager.get('test:miss'); // miss
      const metrics = CacheManager.getMetrics();
      assert.ok(metrics.hits >= 1);
      assert.ok(metrics.misses >= 1);
    });

    await test('CacheManager clearPrefix removes matching keys', () => {
      CacheManager.set('prefix:a', 1);
      CacheManager.set('prefix:b', 2);
      CacheManager.set('other:c', 3);
      CacheManager.clearPrefix('prefix:');
      assert.strictEqual(CacheManager.get('prefix:a'), null);
      assert.strictEqual(CacheManager.get('other:c'), 3);
      CacheManager.clear();
    });

    // ─── 4. METRICS COLLECTOR ────────────────────────────────────────────────
    console.log('\n--- 4. METRICS COLLECTOR ---');

    await test('MetricsCollector increments counters', () => {
      MetricsCollector.reset();
      MetricsCollector.increment('http_requests_total', { method: 'GET' });
      MetricsCollector.increment('http_requests_total', { method: 'GET' });
      MetricsCollector.increment('http_requests_total', { method: 'POST' });
      assert.strictEqual(MetricsCollector.getCounter('http_requests_total', { method: 'GET' }), 2);
      assert.strictEqual(MetricsCollector.getCounter('http_requests_total', { method: 'POST' }), 1);
    });

    await test('MetricsCollector records latency histogram percentiles', () => {
      MetricsCollector.reset();
      const latencies = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      latencies.forEach(l => MetricsCollector.observe('api_latency_ms', l));
      const summary = MetricsCollector.getSummary('api_latency_ms');
      assert.strictEqual(summary.count, 10);
      assert.ok(summary.p50 > 0);
      assert.ok(summary.p95 > 0);
      assert.ok(summary.p99 > 0);
      assert.strictEqual(summary.avg, 55);
    });

    await test('MetricsCollector sets and reads gauges', () => {
      MetricsCollector.reset();
      MetricsCollector.setGauge('webhook_queue_depth', 42);
      assert.strictEqual(MetricsCollector.getGauge('webhook_queue_depth'), 42);
    });

    await test('MetricsCollector snapshot produces complete export', () => {
      const snap = MetricsCollector.snapshot();
      assert.strictEqual(typeof snap.timestamp, 'string');
      assert.strictEqual(typeof snap.uptimeSeconds, 'number');
      assert.strictEqual(typeof snap.counters, 'object');
    });

    // ─── 5. CIRCUIT BREAKER ──────────────────────────────────────────────────
    console.log('\n--- 5. CIRCUIT BREAKER ---');

    await test('CircuitBreaker allows calls in CLOSED state', async () => {
      const cb = new CircuitBreaker({ failureThreshold: 3, cooldownMs: 100 });
      const result = await cb.execute(async () => 'ok');
      assert.strictEqual(result, 'ok');
      assert.strictEqual(cb.state, 'CLOSED');
    });

    await test('CircuitBreaker opens after reaching failure threshold', async () => {
      const cb = new CircuitBreaker({ failureThreshold: 2, cooldownMs: 100 });
      for (let i = 0; i < 2; i++) {
        try { await cb.execute(async () => { throw new Error('fail'); }); } catch (_) {}
      }
      assert.strictEqual(cb.state, 'OPEN');
    });

    await test('CircuitBreaker short-circuits in OPEN state', async () => {
      const cb = new CircuitBreaker({ failureThreshold: 1, cooldownMs: 60000 });
      try { await cb.execute(async () => { throw new Error('fail'); }); } catch (_) {}
      assert.strictEqual(cb.state, 'OPEN');

      let shortCircuited = false;
      try {
        await cb.execute(async () => 'should not run');
      } catch (err) {
        shortCircuited = err.message.includes('short-circuited');
      }
      assert.strictEqual(shortCircuited, true);
    });

    await test('CircuitBreaker transitions HALF_OPEN → CLOSED on success', async () => {
      const cb = new CircuitBreaker({ failureThreshold: 1, cooldownMs: 10, successThreshold: 1 });
      try { await cb.execute(async () => { throw new Error('fail'); }); } catch (_) {}
      assert.strictEqual(cb.state, 'OPEN');

      // Wait for cooldown
      await new Promise(r => setTimeout(r, 15));

      const result = await cb.execute(async () => 'recovered');
      assert.strictEqual(result, 'recovered');
      assert.strictEqual(cb.state, 'CLOSED');
    });

    await test('CircuitBreaker getStatus returns metrics', () => {
      const cb = new CircuitBreaker();
      const status = cb.getStatus();
      assert.strictEqual(status.state, 'CLOSED');
      assert.strictEqual(typeof status.totalCalls, 'number');
    });

    // ─── 6. 404 HANDLING ──────────────────────────────────────────────────────
    console.log('\n--- 6. ERROR HANDLING ---');

    await test('Unknown routes return 404 JSON response', async () => {
      const res = await httpGet('/api/nonexistent-route');
      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.body.error, 'Route not found');
    });

  } finally {
    server.close();
  }

  console.log('\n================================================================');
  console.log(`PRODUCTION HARDENING TESTS: ${passed}/${total} PASSED`);
  console.log('================================================================');

  if (passed !== total) {
    console.error('\n[CRITICAL] Some production hardening tests failed!');
    process.exit(1);
  }

  console.log('\n[SUCCESS] All production hardening infrastructure verified.\n');
}

runProductionHardeningTests().catch((err) => {
  console.error('[FATAL]', err);
  if (server) server.close();
  process.exit(1);
});
