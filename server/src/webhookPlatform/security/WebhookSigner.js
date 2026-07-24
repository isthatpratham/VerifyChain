/**
 * WebhookSigner.js
 * HMAC-SHA256 Webhook Signature Engine & Secret Generation.
 * Computes X-VerifyChain-Signature headers and prevents replay attacks via timestamp validation.
 */
const crypto = require('crypto');

class WebhookSigner {
  /**
   * Generate a high-entropy Webhook Signing Secret (`whsec_...`)
   */
  generateSigningSecret() {
    const rawSecret = crypto.randomBytes(24).toString('hex');
    return `whsec_${rawSecret}`;
  }

  /**
   * Calculate HMAC-SHA256 signature for a webhook payload
   * Header Format: `t=<timestamp>,v1=<signatureHex>`
   * @param {string|object} payload
   * @param {string} secret
   * @param {number} timestamp
   */
  calculateSignature(payload, secret, timestamp = Math.floor(Date.now() / 1000)) {
    if (!payload || !secret) {
      throw new Error('Payload and secret key are required for webhook signing.');
    }

    const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const toSign = `${timestamp}.${payloadString}`;

    const signatureHex = crypto
      .createHmac('sha256', secret)
      .update(toSign, 'utf8')
      .digest('hex');

    return {
      timestamp,
      signatureHex,
      headerValue: `t=${timestamp},v1=${signatureHex}`,
    };
  }

  /**
   * Verify an incoming webhook signature against secret key and timestamp tolerance window
   */
  verifySignature({ payload, signatureHeader, secret, toleranceSeconds = 300 }) {
    if (!signatureHeader || !secret) return false;

    // Parse header: t=<timestamp>,v1=<signatureHex>
    const parts = signatureHeader.split(',');
    let timestamp = null;
    let signatureHex = null;

    for (const part of parts) {
      const [key, val] = part.split('=');
      if (key === 't') timestamp = parseInt(val, 10);
      if (key === 'v1') signatureHex = val;
    }

    if (!timestamp || !signatureHex) return false;

    // Check timestamp freshness to defeat replay attacks
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (Math.abs(nowSeconds - timestamp) > toleranceSeconds) {
      return false; // Timestamp outside tolerance window
    }

    // Recompute signature
    const expected = this.calculateSignature(payload, secret, timestamp);
    return crypto.timingSafeEqual(Buffer.from(signatureHex), Buffer.from(expected.signatureHex));
  }
}

module.exports = new WebhookSigner();
