/**
 * RollbackManager.js
 * Soft Rollback Manager for Enterprise Document Vault Assets (Phase 10.2).
 * Restores historical document state by creating a NEW rollback version without destroying history.
 */

const defaultPrisma = require('../../utils/prismaClient');
const VersionManager = require('./VersionManager');
const VaultAuditPublisher = require('../infrastructure/VaultAuditPublisher');

class RollbackManager {
  /**
   * Execute soft rollback to target historical version
   * @param {string} assetId
   * @param {string} targetVersionNumber - e.g. "v1.0"
   * @param {object} user - User performing rollback
   * @param {string} reason - Reason for rollback
   */
  static async rollbackToVersion(assetId, targetVersionNumber, user = null, reason = null, client = defaultPrisma) {
    const asset = await client.vaultAsset.findUnique({ where: { asset_id: assetId } });
    if (!asset) throw new Error(`Vault Asset '${assetId}' not found for rollback.`);

    const targetVersion = await client.vaultDocumentVersion.findFirst({
      where: { asset_id: asset.id, version_number: targetVersionNumber },
    });

    if (!targetVersion) {
      throw new Error(`Target version '${targetVersionNumber}' not found for asset '${assetId}'.`);
    }

    const changedBy = user?.id ? `USER_${user.id}` : 'SYSTEM';
    const changeSummary = `Soft rollback to historical version '${targetVersionNumber}'. Reason: ${reason || 'User requested restoration'}`;

    // 1. Create a NEW minor version snapshot representing the restored state
    const restoredVersion = await VersionManager.createVersion({
      assetId,
      incrementType: 'MINOR',
      changeSummary,
      changeReason: reason || `Rollback to ${targetVersionNumber}`,
      changedBy,
      fileName: targetVersion.original_file_name,
      mimeType: targetVersion.mime_type,
      storageIdentifier: targetVersion.storage_identifier,
      storageProvider: targetVersion.storage_provider,
      versionTag: 'VERIFIED',
      aiGeneratedFlag: targetVersion.ai_generated_flag,
      updatedMetadata: targetVersion.metadata_snapshot || asset.metadata || {},
      fieldChanges: [
        {
          fieldName: 'rollback_target',
          previousValue: asset.current_version,
          newValue: targetVersionNumber,
          changeType: 'ROLLBACK',
        },
      ],
    }, client);

    // 2. Record Rollback Operation
    await client.vaultRollbackOperation.create({
      data: {
        asset_id: asset.id,
        target_version_number: targetVersionNumber,
        new_version_number: restoredVersion.version_number,
        restored_by: changedBy,
        reason: reason || 'Restored historical state',
      },
    });

    await VaultAuditPublisher.publishVaultEvent({
      assetId: asset.asset_id,
      action: 'VAULT_VERSION_ROLLBACK',
      actorId: changedBy,
      msmeId: asset.msme_id || 1,
      details: {
        targetVersionNumber,
        newVersionNumber: restoredVersion.version_number,
        reason,
      },
    });

    return {
      assetId,
      targetVersionNumber,
      newVersionNumber: restoredVersion.version_number,
      restoredVersion,
    };
  }
}

module.exports = RollbackManager;
