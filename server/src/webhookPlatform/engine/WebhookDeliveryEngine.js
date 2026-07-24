/**
 * WebhookDeliveryEngine.js
 * Asynchronous HTTP Webhook Dispatch Worker.
 * Formats payload envelopes, signs requests with HMAC-SHA256, dispatches HTTP POSTs,
 * measures response latency, and logs delivery attempts to PostgreSQL.
 */
const http = require('http');
const https = require('https');
const WebhookSigner = require('../security/WebhookSigner');
const defaultPrisma = require('../../utils/prismaClient');
const { IntegrationLogger } = require('../../integrationPlatform');

class WebhookDeliveryEngine {
  /**
   * Dispatch a webhook delivery to a subscriber endpoint
   * @param {object} subscription - WebhookSubscription record
   * @param {object} eventPayload - Standardized event payload
   * @param {object} options - Timeout & attempt options
   */
  async dispatchDelivery(subscription, eventPayload, { timeoutMs = 5000, isReplay = false } = {}) {
    const deliveryId = `del_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const timestamp = Math.floor(Date.now() / 1000);

    const fullPayload = {
      deliveryId,
      subscriptionId: subscription.subscription_id,
      event: eventPayload.event,
      contractVersion: eventPayload.contractVersion || 'v1.0.0',
      timestamp: eventPayload.timestamp || new Date().toISOString(),
      correlationId: eventPayload.correlationId || IntegrationLogger.createCorrelationId(),
      data: eventPayload.data || {},
      isReplay,
    };

    // Calculate HMAC-SHA256 signature
    // Decrypt secret or compute using stored secret_hash / signing secret
    const secret = subscription.raw_secret || subscription.secret_hash || 'whsec_verifychain_default_secret_9988';
    const signatureInfo = WebhookSigner.calculateSignature(fullPayload, secret, timestamp);

    // Save initial WebhookDelivery record in DB
    const dbDelivery = await defaultPrisma.webhookDelivery.create({
      data: {
        subscription_id: subscription.id,
        event_type: fullPayload.event,
        event_id: eventPayload.eventId || deliveryId,
        payload_json: JSON.parse(JSON.stringify(fullPayload)),
        status: 'PENDING',
        attempt_count: 1,
      },
    });

    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'VerifyChain-WebhookPlatform/1.0',
      'X-VerifyChain-Event': fullPayload.event,
      'X-VerifyChain-Delivery-ID': deliveryId,
      'X-VerifyChain-Signature': signatureInfo.headerValue,
      'X-VerifyChain-Timestamp': String(timestamp),
    };

    const startTime = Date.now();

    try {
      const httpResult = await this._sendHttpRequest(subscription.target_url, fullPayload, headers, timeoutMs);
      const executionTimeMs = Date.now() - startTime;

      const isSuccess = httpResult.statusCode >= 200 && httpResult.statusCode < 300;
      const status = isSuccess ? 'DELIVERED' : 'FAILED';

      // Update WebhookDelivery status
      await defaultPrisma.webhookDelivery.update({
        where: { id: dbDelivery.id },
        data: { status },
      });

      // Record WebhookAttempt log
      await defaultPrisma.webhookAttempt.create({
        data: {
          delivery_id: dbDelivery.id,
          response_status: httpResult.statusCode,
          response_body: String(httpResult.body).substring(0, 1000),
          execution_time_ms: executionTimeMs,
          error_message: isSuccess ? null : `HTTP ${httpResult.statusCode}`,
        },
      });

      IntegrationLogger.logEvent(isSuccess ? 'INFO' : 'WARN', `Webhook delivery [${deliveryId}] to ${subscription.target_url} status: ${status}`, {
        subscriptionId: subscription.subscription_id,
        targetUrl: subscription.target_url,
        event: fullPayload.event,
        statusCode: httpResult.statusCode,
        executionTimeMs,
      });

      return {
        deliveryId: dbDelivery.id,
        status,
        statusCode: httpResult.statusCode,
        executionTimeMs,
      };
    } catch (err) {
      const executionTimeMs = Date.now() - startTime;

      await defaultPrisma.webhookDelivery.update({
        where: { id: dbDelivery.id },
        data: { status: 'FAILED', next_retry_at: new Date(Date.now() + 10000) },
      });

      await defaultPrisma.webhookAttempt.create({
        data: {
          delivery_id: dbDelivery.id,
          response_status: 0,
          response_body: null,
          execution_time_ms: executionTimeMs,
          error_message: err.message,
        },
      });

      IntegrationLogger.logEvent('ERROR', `Webhook delivery dispatch failed [${deliveryId}]: ${err.message}`, {
        subscriptionId: subscription.subscription_id,
        targetUrl: subscription.target_url,
        error: err.message,
      });

      return {
        deliveryId: dbDelivery.id,
        status: 'FAILED',
        error: err.message,
        executionTimeMs,
      };
    }
  }

  /**
   * Send HTTP POST request with timeout
   */
  _sendHttpRequest(urlStr, payloadObj, headers, timeoutMs) {
    return new Promise((resolve, reject) => {
      const url = new URL(urlStr);
      const httpModule = url.protocol === 'https:' ? https : http;
      const bodyData = JSON.stringify(payloadObj);

      headers['Content-Length'] = Buffer.byteLength(bodyData);

      const req = httpModule.request({
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: 'POST',
        headers,
        timeout: timeoutMs,
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, body }));
      });

      req.on('timeout', () => {
        req.destroy(new Error(`Webhook HTTP request timed out after ${timeoutMs}ms`));
      });

      req.on('error', (err) => {
        reject(err && err.message ? err : new Error(err ? String(err) : 'Webhook HTTP request error'));
      });
      req.write(bodyData);
      req.end();
    });
  }
}

module.exports = new WebhookDeliveryEngine();
