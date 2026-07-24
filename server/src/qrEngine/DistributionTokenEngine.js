/**
 * DistributionTokenEngine.js
 * Generates and validates cryptographically signed distribution tokens for dynamic QR codes.
 * Supports token signature verification, expiration checks, and revocation state tracking.
 */
const crypto = require('crypto');

class DistributionTokenEngine {
  constructor() {
    this.SECRET = process.env.JWT_SECRET || 'verifychain-trust-token-secret-2026';
    this.revokedTokens = new Set();
  }

  /**
   * Issue a signed distribution token
   */
  issueToken({ stableDistributionId, publicSlug, expirationDays = 365 }) {
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = issuedAt + expirationDays * 86400;

    const payloadStr = `${stableDistributionId}:${publicSlug}:${issuedAt}:${expiresAt}`;
    const signature = crypto.createHmac('sha256', this.SECRET).update(payloadStr).digest('hex');

    const tokenId = `VC-TKN-${stableDistributionId}-${signature.substring(0, 12)}`;

    return {
      tokenId,
      stableDistributionId,
      publicSlug,
      issuedAt: new Date(issuedAt * 1000).toISOString(),
      expiresAt: new Date(expiresAt * 1000).toISOString(),
      signature,
      rawToken: `${payloadStr}:${signature}`,
    };
  }

  /**
   * Validate a signed distribution token
   */
  validateToken(rawToken) {
    if (!rawToken || typeof rawToken !== 'string') {
      return { isValid: false, reason: 'INVALID_TOKEN_FORMAT' };
    }

    if (this.revokedTokens.has(rawToken)) {
      return { isValid: false, reason: 'TOKEN_REVOKED' };
    }

    const parts = rawToken.split(':');
    if (parts.length !== 5) {
      return { isValid: false, reason: 'MALFORMED_TOKEN_STRUCTURE' };
    }

    const [stableDistributionId, publicSlug, issuedAtStr, expiresAtStr, signature] = parts;
    const issuedAt = parseInt(issuedAtStr, 10);
    const expiresAt = parseInt(expiresAtStr, 10);
    const now = Math.floor(Date.now() / 1000);

    if (now > expiresAt) {
      return { isValid: false, reason: 'TOKEN_EXPIRED', expiresAt: new Date(expiresAt * 1000).toISOString() };
    }

    const payloadStr = `${stableDistributionId}:${publicSlug}:${issuedAt}:${expiresAt}`;
    const expectedSignature = crypto.createHmac('sha256', this.SECRET).update(payloadStr).digest('hex');

    if (signature !== expectedSignature) {
      return { isValid: false, reason: 'INVALID_SIGNATURE' };
    }

    return {
      isValid: true,
      stableDistributionId,
      publicSlug,
      issuedAt: new Date(issuedAt * 1000).toISOString(),
      expiresAt: new Date(expiresAt * 1000).toISOString(),
    };
  }

  /**
   * Revoke a distribution token
   */
  revokeToken(rawToken) {
    if (rawToken) {
      this.revokedTokens.add(rawToken);
    }
    return { success: true, revokedAt: new Date().toISOString() };
  }
}

module.exports = new DistributionTokenEngine();
