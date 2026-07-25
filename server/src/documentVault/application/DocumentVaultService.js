/**
 * DocumentVaultService.js
 * Application Service for Enterprise Document Vault Operations.
 */

const VaultRepository = require('../infrastructure/VaultRepository');
const StorageProviderFactory = require('../storage/StorageProviderFactory');
const VaultMetadataService = require('../metadata/VaultMetadataService');
const { VAULT_STATUSES, canTransition } = require('../domain/VaultStatus');
const VaultAuditPublisher = require('../infrastructure/VaultAuditPublisher');
const VaultPermissionService = require('../permission/VaultPermissionService');
const defaultPrisma = require('../../utils/prismaClient');
const VersionManager = require('../versioning/VersionManager');

class DocumentVaultService {
  /**
   * Ingest and store file as Vault Asset in Enterprise Document Vault
   */
  static async ingestAsset({
    fileBuffer,
    fileName,
    mimeType = 'application/octet-stream',
    title = null,
    displayName = null,
    documentType = 'OTHER',
    category = 'BUSINESS',
    ownerId = null,
    msmeId = 1,
    complianceCategory = null,
    aiAnalysisReference = null,
    source = 'DIRECT_UPLOAD',
    metadata = {},
    user = null,
  }) {
    if (user) {
      const perm = VaultPermissionService.validateAccess({ user, requestedAction: 'UPLOAD' });
      if (!perm.allowed) {
        throw new Error(`Permission denied for vault upload. Reason: ${perm.reason}`);
      }
    }

    const providerType = process.env.STORAGE_PROVIDER || 'LOCAL';
    const provider = StorageProviderFactory.getProvider(providerType);

    // 1. Store file binary in storage provider
    const { storageIdentifier, checksum, fileSize } = await provider.store({
      fileBuffer,
      fileName,
      mimeType,
    });

    // 2. Build metadata payload
    const fullMetadata = VaultMetadataService.buildMetadata({
      fileMetadata: { extension: fileName.split('.').pop(), encoding: 'utf-8' },
      businessMetadata: metadata.businessMetadata || {},
      complianceMetadata: metadata.complianceMetadata || {},
      aiMetadata: metadata.aiMetadata || { analysisId: aiAnalysisReference },
      storageMetadata: { checksum, storageKey: storageIdentifier },
      customMetadata: metadata.customMetadata || {},
    });

    // 3. Create Vault Asset database record
    const asset = await VaultRepository.createAsset({
      title: title || fileName,
      displayName: displayName || title || fileName,
      originalFileName: fileName,
      storageIdentifier,
      storageProvider: providerType,
      documentType,
      category,
      ownerId: ownerId || user?.id || null,
      msmeId: msmeId || user?.msmeId || 1,
      complianceCategory,
      aiAnalysisReference,
      status: VAULT_STATUSES.VERIFIED,
      createdBy: user?.id ? `USER_${user.id}` : 'SYSTEM',
      updatedBy: user?.id ? `USER_${user.id}` : 'SYSTEM',
      checksum,
      mimeType,
      fileSize,
      source,
      metadata: fullMetadata,
    });

    // 4. Record initial v1.0 Version Snapshot in DB
    await defaultPrisma.vaultDocumentVersion.create({
      data: {
        asset_id: asset.id,
        version_number: 'v1.0',
        major_version: 1,
        minor_version: 0,
        title: asset.title,
        display_name: asset.displayName || asset.title,
        original_file_name: fileName,
        storage_identifier: asset.storageIdentifier || storageIdentifier,
        storage_provider: providerType,
        status: asset.status,
        version_tag: 'PUBLISHED',
        change_summary: 'Initial asset ingestion into vault',
        changed_by: user?.id ? `USER_${user.id}` : 'SYSTEM',
        checksum,
        mime_type: mimeType,
        file_size: fileSize,
        metadata_snapshot: fullMetadata,
      },
    });

    await defaultPrisma.vaultDocumentLineage.create({
      data: {
        asset_id: asset.id,
        parent_version_number: null,
        child_version_number: 'v1.0',
        lineage_type: 'ORIGINAL_INGESTION',
        description: 'Initial ingestion',
      },
    });

    // 5. Record audit log
    await VaultRepository.recordAudit({
      assetId: asset.assetId,
      action: 'VAULT_ASSET_REGISTERED',
      actorId: user?.id ? `USER_${user.id}` : 'SYSTEM',
      newStatus: asset.status,
      details: { fileName, fileSize, mimeType, category, documentType },
    });

    await VaultAuditPublisher.publishVaultEvent({
      assetId: asset.assetId,
      action: 'VAULT_ASSET_REGISTERED',
      actorId: user?.id ? `USER_${user.id}` : 'SYSTEM',
      msmeId: asset.msmeId,
      details: { title: asset.title, category: asset.category },
    });

    return asset;
  }

  /**
   * Update Asset Lifecycle Status with Audit Trail
   */
  static async updateAssetStatus(assetId, newStatus, user = null, notes = null) {
    const asset = await VaultRepository.findByAssetId(assetId);
    if (!asset) throw new Error(`Vault Asset '${assetId}' not found.`);

    if (user) {
      const perm = VaultPermissionService.validateAccess({ user, requestedAction: 'UPDATE', asset });
      if (!perm.allowed) {
        throw new Error(`Permission denied to update asset status. Reason: ${perm.reason}`);
      }
    }

    if (!canTransition(asset.status, newStatus)) {
      throw new Error(`Invalid status transition from '${asset.status}' to '${newStatus}'.`);
    }

    const updated = await VaultRepository.updateAsset(assetId, {
      status: newStatus,
      updatedBy: user?.id ? `USER_${user.id}` : 'SYSTEM',
    });

    await VaultRepository.recordAudit({
      assetId: asset.assetId,
      action: 'VAULT_STATUS_CHANGED',
      actorId: user?.id ? `USER_${user.id}` : 'SYSTEM',
      oldStatus: asset.status,
      newStatus,
      details: { notes },
    });

    return updated;
  }

  /**
   * Archive Vault Asset
   */
  static async archiveAsset(assetId, user = null) {
    const asset = await VaultRepository.findByAssetId(assetId);
    if (!asset) throw new Error(`Vault Asset '${assetId}' not found.`);

    if (user) {
      const perm = VaultPermissionService.validateAccess({ user, requestedAction: 'ARCHIVE', asset });
      if (!perm.allowed) throw new Error(`Permission denied to archive asset. Reason: ${perm.reason}`);
    }

    const updated = await VaultRepository.updateAsset(assetId, {
      status: VAULT_STATUSES.ARCHIVED,
      archivedFlag: true,
      updatedBy: user?.id ? `USER_${user.id}` : 'SYSTEM',
    });

    await VaultRepository.recordAudit({
      assetId: asset.assetId,
      action: 'VAULT_ASSET_ARCHIVED',
      actorId: user?.id ? `USER_${user.id}` : 'SYSTEM',
      oldStatus: asset.status,
      newStatus: VAULT_STATUSES.ARCHIVED,
    });

    return updated;
  }

  /**
   * Restore Vault Asset
   */
  static async restoreAsset(assetId, user = null) {
    const asset = await VaultRepository.findByAssetId(assetId);
    if (!asset) throw new Error(`Vault Asset '${assetId}' not found.`);

    if (user) {
      const perm = VaultPermissionService.validateAccess({ user, requestedAction: 'RESTORE', asset });
      if (!perm.allowed) throw new Error(`Permission denied to restore asset. Reason: ${perm.reason}`);
    }

    const updated = await VaultRepository.updateAsset(assetId, {
      status: VAULT_STATUSES.RESTORED,
      archivedFlag: false,
      deletedFlag: false,
      updatedBy: user?.id ? `USER_${user.id}` : 'SYSTEM',
    });

    await VaultRepository.recordAudit({
      assetId: asset.assetId,
      action: 'VAULT_ASSET_RESTORED',
      actorId: user?.id ? `USER_${user.id}` : 'SYSTEM',
      oldStatus: asset.status,
      newStatus: VAULT_STATUSES.RESTORED,
    });

    return updated;
  }

  /**
   * Soft Delete Vault Asset
   */
  static async deleteAsset(assetId, user = null) {
    const asset = await VaultRepository.findByAssetId(assetId);
    if (!asset) throw new Error(`Vault Asset '${assetId}' not found.`);

    if (user) {
      const perm = VaultPermissionService.validateAccess({ user, requestedAction: 'DELETE', asset });
      if (!perm.allowed) throw new Error(`Permission denied to delete asset. Reason: ${perm.reason}`);
    }

    const updated = await VaultRepository.updateAsset(assetId, {
      status: VAULT_STATUSES.DELETED,
      deletedFlag: true,
      updatedBy: user?.id ? `USER_${user.id}` : 'SYSTEM',
    });

    await VaultRepository.recordAudit({
      assetId: asset.assetId,
      action: 'VAULT_ASSET_DELETED',
      actorId: user?.id ? `USER_${user.id}` : 'SYSTEM',
      oldStatus: asset.status,
      newStatus: VAULT_STATUSES.DELETED,
    });

    return updated;
  }

  /**
   * Update Asset Extensible Metadata
   */
  static async updateMetadata(assetId, newMetadataFields = {}, user = null) {
    const asset = await VaultRepository.findByAssetId(assetId);
    if (!asset) throw new Error(`Vault Asset '${assetId}' not found.`);

    const mergedMetadata = VaultMetadataService.mergeMetadata(asset.metadata, newMetadataFields);

    const updated = await VaultRepository.updateAsset(assetId, {
      metadata: mergedMetadata,
      updatedBy: user?.id ? `USER_${user.id}` : 'SYSTEM',
    });

    await VaultRepository.recordAudit({
      assetId: asset.assetId,
      action: 'VAULT_METADATA_UPDATED',
      actorId: user?.id ? `USER_${user.id}` : 'SYSTEM',
      details: { updatedKeys: Object.keys(newMetadataFields) },
    });

    return updated;
  }
}

module.exports = DocumentVaultService;
