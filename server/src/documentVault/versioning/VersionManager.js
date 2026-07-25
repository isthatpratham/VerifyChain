/**
 * VersionManager.js
 * Enterprise Document Version Manager (Phase 10.2).
 * Handles major/minor version increments, creates immutable version snapshots, and manages version tags.
 */

const defaultPrisma = require('../../utils/prismaClient');
const VaultAuditPublisher = require('../infrastructure/VaultAuditPublisher');

class VersionManager {
  /**
   * Calculate next version string based on increment type (MAJOR vs MINOR)
   * @param {string} currentVersion - e.g. "v1.0"
   * @param {string} incrementType - "MAJOR" | "MINOR"
   */
  static calculateNextVersion(currentVersion = 'v1.0', incrementType = 'MINOR') {
    const clean = (currentVersion || 'v1.0').replace(/^v/, '');
    const parts = clean.split('.').map(p => parseInt(p, 10) || 0);
    let major = parts[0] || 1;
    let minor = parts[1] || 0;

    if (incrementType.toUpperCase() === 'MAJOR') {
      major += 1;
      minor = 0;
    } else {
      minor += 1;
    }

    return {
      versionNumber: `v${major}.${minor}`,
      majorVersion: major,
      minorVersion: minor,
    };
  }

  /**
   * Create an Immutable Version Snapshot for a Vault Asset
   */
  static async createVersion({
    assetId,
    incrementType = 'MINOR', // "MAJOR" | "MINOR"
    changeSummary = 'Metadata / Content update',
    changeReason = null,
    changedBy = 'SYSTEM',
    fileBuffer = null,
    fileName = null,
    mimeType = null,
    storageIdentifier = null,
    storageProvider = 'LOCAL',
    versionTag = 'PUBLISHED',
    aiGeneratedFlag = false,
    updatedMetadata = null,
    fieldChanges = [],
  }, client = defaultPrisma) {
    const asset = await client.vaultAsset.findUnique({ where: { asset_id: assetId } });
    if (!asset) {
      throw new Error(`Vault Asset '${assetId}' not found for version creation.`);
    }

    const { versionNumber, majorVersion, minorVersion } = this.calculateNextVersion(asset.current_version, incrementType);

    const versionRecord = await client.vaultDocumentVersion.create({
      data: {
        asset_id: asset.id,
        version_number: versionNumber,
        major_version: majorVersion,
        minor_version: minorVersion,
        title: asset.title,
        display_name: asset.display_name,
        original_file_name: fileName || asset.original_file_name,
        storage_identifier: storageIdentifier || asset.storage_identifier,
        storage_provider: storageProvider || asset.storage_provider,
        status: asset.status,
        version_tag: versionTag,
        change_summary: changeSummary,
        change_reason: changeReason,
        changed_by: changedBy,
        ai_generated_flag: aiGeneratedFlag,
        checksum: asset.checksum,
        mime_type: mimeType || asset.mime_type,
        file_size: asset.file_size,
        metadata_snapshot: updatedMetadata || asset.metadata || {},
      },
    });

    // Record field-level changes
    if (fieldChanges && Array.isArray(fieldChanges)) {
      for (const fc of fieldChanges) {
        await client.vaultVersionChange.create({
          data: {
            version_id: versionRecord.id,
            field_name: fc.fieldName,
            previous_value: String(fc.previousValue || ''),
            new_value: String(fc.newValue || ''),
            change_type: fc.changeType || 'METADATA_UPDATE',
          },
        });
      }
    }

    // Update parent VaultAsset current_version string
    await client.vaultAsset.update({
      where: { id: asset.id },
      data: {
        current_version: versionNumber,
        updated_by: changedBy,
        metadata: updatedMetadata || asset.metadata,
      },
    });

    // Record Lineage
    await client.vaultDocumentLineage.create({
      data: {
        asset_id: asset.id,
        parent_version_number: asset.current_version,
        child_version_number: versionNumber,
        lineage_type: incrementType === 'MAJOR' ? 'MAJOR_REVISION' : 'MINOR_REVISION',
        description: changeSummary,
      },
    });

    await VaultAuditPublisher.publishVaultEvent({
      assetId: asset.asset_id,
      action: 'VAULT_VERSION_CREATED',
      actorId: changedBy,
      msmeId: asset.msme_id || 1,
      details: { versionNumber, changeSummary, incrementType },
    });

    return versionRecord;
  }

  /**
   * Get all Version Snapshots for an Asset
   */
  static async getVersionHistory(assetId, client = defaultPrisma) {
    const asset = await client.vaultAsset.findUnique({ where: { asset_id: assetId } });
    if (!asset) throw new Error(`Vault Asset '${assetId}' not found.`);

    return await client.vaultDocumentVersion.findMany({
      where: { asset_id: asset.id },
      orderBy: { created_at: 'desc' },
      include: { changes: true },
    });
  }

  /**
   * Get Specific Version Snapshot by Asset ID and Version Number
   */
  static async getVersionByNumber(assetId, versionNumber, client = defaultPrisma) {
    const asset = await client.vaultAsset.findUnique({ where: { asset_id: assetId } });
    if (!asset) throw new Error(`Vault Asset '${assetId}' not found.`);

    return await client.vaultDocumentVersion.findFirst({
      where: { asset_id: asset.id, version_number: versionNumber },
      include: { changes: true },
    });
  }
}

module.exports = VersionManager;
