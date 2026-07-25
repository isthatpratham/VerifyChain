/**
 * VaultAuditPublisher.js
 * Audit Publisher for Enterprise Document Vault Events.
 */

const AuditPublisher = require('../../audit/AuditPublisher');

class VaultAuditPublisher {
  static async publishVaultEvent({
    assetId,
    action, // VAULT_ASSET_REGISTERED, VAULT_ASSET_VIEWED, VAULT_ASSET_DOWNLOADED, VAULT_ASSET_UPDATED, VAULT_ASSET_ARCHIVED, VAULT_ASSET_RESTORED, VAULT_ASSET_DELETED
    actorId = 'SYSTEM',
    msmeId = 1,
    details = {},
    status = 'SUCCESS',
  }) {
    try {
      await AuditPublisher.publishSecurity({
        actorId,
        msmeId,
        action,
        severity: action.includes('DELETE') ? 'WARNING' : 'INFO',
        status,
        details: {
          assetId,
          ...details,
        },
      });
    } catch (_) {
      // Non-blocking audit safety
    }
  }
}

module.exports = VaultAuditPublisher;
