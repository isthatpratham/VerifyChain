/**
 * VaultRetrievalService.js
 * Retrieval & Search Foundation for Enterprise Document Vault.
 */

const VaultRepository = require('../infrastructure/VaultRepository');
const StorageProviderFactory = require('../storage/StorageProviderFactory');
const VaultAuditPublisher = require('../infrastructure/VaultAuditPublisher');
const VaultPermissionService = require('../permission/VaultPermissionService');

class VaultRetrievalService {
  /**
   * Search and filter vault assets
   */
  static async searchAssets(filterParams = {}) {
    return await VaultRepository.findAssets(filterParams);
  }

  /**
   * Get single asset by assetId with permission validation
   */
  static async getAssetById(assetId, user = null) {
    const asset = await VaultRepository.findByAssetId(assetId);
    if (!asset) {
      throw new Error(`Vault Asset '${assetId}' not found.`);
    }

    if (user) {
      const perm = VaultPermissionService.validateAccess({ user, requestedAction: 'READ', asset });
      if (!perm.allowed) {
        throw new Error(`Access denied to Vault Asset '${assetId}'. Reason: ${perm.reason}`);
      }
    }

    await VaultAuditPublisher.publishVaultEvent({
      assetId: asset.assetId,
      action: 'VAULT_ASSET_VIEWED',
      actorId: user?.id ? `USER_${user.id}` : 'SYSTEM',
      msmeId: asset.msmeId || 1,
    });

    return asset;
  }

  /**
   * Secure stream download for a Vault Asset
   */
  static async downloadAsset(assetId, user = null) {
    const asset = await this.getAssetById(assetId, user);

    const provider = StorageProviderFactory.getProvider(asset.storageProvider);
    const { buffer } = await provider.retrieve(asset.storageIdentifier);

    // Verify integrity / checksum match
    const isValid = await provider.verifyIntegrity(asset.storageIdentifier, asset.checksum);
    if (!isValid) {
      await VaultAuditPublisher.publishVaultEvent({
        assetId: asset.assetId,
        action: 'VAULT_INTEGRITY_FAILURE',
        actorId: user?.id ? `USER_${user.id}` : 'SYSTEM',
        msmeId: asset.msmeId || 1,
        status: 'FAILURE',
      });
      throw new Error(`Checksum verification failed for asset '${assetId}'. File corrupted or tampered.`);
    }

    await VaultAuditPublisher.publishVaultEvent({
      assetId: asset.assetId,
      action: 'VAULT_ASSET_DOWNLOADED',
      actorId: user?.id ? `USER_${user.id}` : 'SYSTEM',
      msmeId: asset.msmeId || 1,
    });

    return {
      asset,
      buffer,
      fileName: asset.originalFileName,
      mimeType: asset.mimeType,
      checksum: asset.checksum,
    };
  }

  /**
   * Get repository statistics & metrics
   */
  static async getRepositoryMetrics(msmeId = 1) {
    return await VaultRepository.getRepositoryMetrics(msmeId);
  }
}

module.exports = VaultRetrievalService;
