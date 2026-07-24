/**
 * health.routes.js
 * Enterprise Health, Readiness & Liveness Probe Endpoints.
 * Designed for Kubernetes, Docker, and Cloud Load Balancer health checks.
 *
 *   GET /health/liveness  — Process alive check (always 200 if the process is running)
 *   GET /health/readiness — Dependency health check (database connectivity)
 *   GET /health/metrics   — Operational metrics snapshot (cache, uptime, memory)
 */
const express = require('express');
const router = express.Router();
const defaultPrisma = require('../../../utils/prismaClient');
const CacheManager = require('../../../utils/CacheManager');

const startTime = Date.now();

/**
 * GET /health/liveness
 * Minimal liveness check — confirms the Node.js process is responsive.
 * Kubernetes uses this to decide whether to restart a pod.
 */
router.get('/liveness', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
  });
});

/**
 * GET /health/readiness
 * Readiness check — verifies critical dependencies (database) are reachable.
 * Kubernetes uses this to decide whether to route traffic to the pod.
 */
router.get('/readiness', async (req, res) => {
  const checks = { database: 'UNKNOWN' };
  let overall = 'UP';

  try {
    await defaultPrisma.$queryRaw`SELECT 1`;
    checks.database = 'HEALTHY';
  } catch (err) {
    checks.database = 'UNHEALTHY';
    overall = 'DOWN';
    console.error('[Health] Database readiness check failed:', err.message);
  }

  const statusCode = overall === 'UP' ? 200 : 503;
  res.status(statusCode).json({
    status: overall,
    timestamp: new Date().toISOString(),
    checks,
  });
});

/**
 * GET /health/metrics
 * Operational metrics snapshot for monitoring dashboards and Prometheus scraping.
 */
router.get('/metrics', (req, res) => {
  const memUsage = process.memoryUsage();

  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    memory: {
      rssBytes: memUsage.rss,
      heapUsedBytes: memUsage.heapUsed,
      heapTotalBytes: memUsage.heapTotal,
      externalBytes: memUsage.external,
    },
    cache: CacheManager.getMetrics(),
    node: {
      version: process.version,
      platform: process.platform,
      pid: process.pid,
    },
  });
});

module.exports = router;
