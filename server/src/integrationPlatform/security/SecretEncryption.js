/**
 * SecretEncryption.js
 * AES-256-GCM symmetric credential & secret encryption utility at rest.
 * Uses zero external dependencies, leveraging Node.js native crypto module.
 */
const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH_BYTES = 12;
const AUTH_TAG_LENGTH_BYTES = 16;

/**
 * Get or derive a 32-byte (256-bit) encryption key from environment variable or fallback
 */
function getMasterKey() {
  const masterSecret = process.env.INTEGRATION_MASTER_KEY || process.env.JWT_SECRET || 'verifychain_integration_master_secret_key_32bytes!';
  return crypto.createHash('sha256').update(masterSecret).digest();
}

/**
 * Encrypt plain text using AES-256-GCM
 * Returns payload string format: `iv:authTag:cipherText`
 */
function encryptSecret(plainText) {
  if (!plainText) return null;
  const key = getMasterKey();
  const iv = crypto.randomBytes(IV_LENGTH_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');
  const ivHex = iv.toString('hex');

  return `${ivHex}:${authTag}:${encrypted}`;
}

/**
 * Decrypt ciphertext payload formatted as `iv:authTag:cipherText`
 */
function decryptSecret(encryptedPayload) {
  if (!encryptedPayload) return null;
  const parts = encryptedPayload.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted payload format. Expected iv:authTag:cipherText');
  }

  const [ivHex, authTagHex, cipherText] = parts;
  const key = getMasterKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(cipherText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

module.exports = {
  encryptSecret,
  decryptSecret,
};
