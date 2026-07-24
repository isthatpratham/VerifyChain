/**
 * ApiKeyManager.js
 * High-security API Key Infrastructure.
 * Performs high-entropy key generation, SHA-256 cryptographic hashing, zero raw key storage,
 * environment separation (vc_live_ / vc_test_), rotation, and revocation.
 */
const crypto = require('crypto');

class ApiKeyManager {
  /**
   * Generate a secure, high-entropy API key pair (raw key for user, hash for DB)
   * @param {string} environment - "PRODUCTION" or "SANDBOX"
   * @returns {{ rawKey: string, keyPrefix: string, keyHash: string }}
   */
  generateKeyPair(environment = 'PRODUCTION') {
    const isProd = environment === 'PRODUCTION';
    const prefix = isProd ? 'vc_live_' : 'vc_test_';
    const randomBuffer = crypto.randomBytes(24);
    const rawSecret = randomBuffer.toString('hex');
    const rawKey = `${prefix}${rawSecret}`;

    const keyHash = this.hashKey(rawKey);

    return {
      rawKey,
      keyPrefix: prefix,
      keyHash,
    };
  }

  /**
   * Cryptographically hash a raw API key using SHA-256
   * @param {string} rawKey
   * @returns {string} SHA-256 hex hash
   */
  hashKey(rawKey) {
    if (!rawKey || typeof rawKey !== 'string') {
      throw new Error('Raw API key must be a non-empty string.');
    }
    return crypto.createHash('sha256').update(rawKey).digest('hex');
  }

  /**
   * Verify if a raw key matches a stored SHA-256 hash
   * @param {string} rawKey
   * @param {string} storedHash
   * @returns {boolean}
   */
  verifyKey(rawKey, storedHash) {
    if (!rawKey || !storedHash) return false;
    const computedHash = this.hashKey(rawKey);
    return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(storedHash));
  }

  /**
   * Check if an API key has expired based on expiration timestamp
   * @param {Date|string|null} expiresAt
   * @returns {boolean}
   */
  isKeyExpired(expiresAt) {
    if (!expiresAt) return false;
    const expTime = new Date(expiresAt).getTime();
    return Date.now() > expTime;
  }
}

module.exports = new ApiKeyManager();
