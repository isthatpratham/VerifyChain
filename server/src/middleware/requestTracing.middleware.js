/**
 * requestTracing.middleware.js
 * Injects request ID, correlation ID, measures API latency, and logs structured telemetry.
 */
const crypto = require('crypto');
const { IntegrationLogger } = require('../integrationPlatform');

function requestTracingMiddleware(req, res, next) {
  const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const correlationId = req.headers['x-correlation-id'] || IntegrationLogger.createCorrelationId();

  req.requestId = requestId;
  req.correlationId = correlationId;

  res.setHeader('X-Request-ID', requestId);
  res.setHeader('X-Correlation-ID', correlationId);

  const startTime = Date.now();

  res.on('finish', () => {
    const latencyMs = Date.now() - startTime;
    IntegrationLogger.logEvent('INFO', `API ${req.method} ${req.originalUrl} [${res.statusCode}] - ${latencyMs}ms`, {
      requestId,
      correlationId,
      method: req.method,
      endpoint: req.originalUrl,
      statusCode: res.statusCode,
      latencyMs,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
    });
  });

  next();
}

module.exports = requestTracingMiddleware;
