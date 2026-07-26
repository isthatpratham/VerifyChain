/**
 * ArchiveService.js
 * Enterprise Archival & Cold Storage Management for Vault (Phase 10.5).
 */

const defaultPrisma = require('../../utils/prismaClient');

class ArchiveService {
  /**
   * Move asset to Vault Archive
   */
  static async archiveAsset(params, client = defaultPrisma) {
    let assetId, archivedBy = 'SYSTEM', storageTier = 'COLD_ARCHIVE', archiveType = 'MANUAL', msmeId = 1;
    if (typeof params === 'object' && params !== null) {
      assetId = params.assetId || params.id;
      archivedBy = params.archivedBy || (params.user ? String(params.user.id) : 'SYSTEM');
      storageTier = params.storageTier || 'COLD_ARCHIVE';
      archiveType = params.archiveType || 'MANUAL';
      msmeId = params.msmeId || (params.user ? params.user.msmeId : 1);
    } else {
      assetId = params;
    }

    const asset = await client.vaultAsset.findFirst({
      where: {
        OR: [
          { asset_id: assetId },
          { id: isNaN(Number(assetId)) ? -1 : Number(assetId) },
        ],
        msme_id: msmeId,
      },
    });

    if (!asset) {
      throw new Error(`Asset '${assetId}' not found`);
    }

    if (asset.legal_hold_flag) {
      throw new Error(`Cannot archive asset '${asset.title}' while under active Legal Hold`);
    }

    const archiveRecord = await client.vaultArchiveRecord.create({
      data: {
        msme_id: msmeId,
        asset_id: asset.id,
        archive_type: archiveType,
        storage_tier: storageTier,
        archived_by: archivedBy,
      },
    });

    await client.vaultAsset.update({
      where: { id: asset.id },
      data: {
        archived_flag: true,
        status: 'ARCHIVED',
        lifecycle_state: 'ARCHIVED',
      },
    });

    await client.vaultRetentionEvent.create({
      data: {
        msme_id: msmeId,
        asset_id: asset.id,
        event_type: 'ARCHIVED',
        summary: `Asset '${asset.title}' moved to ${storageTier} storage`,
        actor_id: archivedBy,
      },
    });

    return archiveRecord;
  }

  static async restoreAsset(params, client = defaultPrisma) {
    let assetId, restoredBy = 'SYSTEM', msmeId = 1;
    if (typeof params === 'object' && params !== null) {
      assetId = params.assetId || params.id;
      restoredBy = params.restoredBy || (params.user ? String(params.user.id) : 'SYSTEM');
      msmeId = params.msmeId || (params.user ? params.user.msmeId : 1);
    } else {
      assetId = params;
    }

    const asset = await client.vaultAsset.findFirst({
      where: {
        OR: [
          { asset_id: assetId },
          { id: isNaN(Number(assetId)) ? -1 : Number(assetId) },
        ],
        msme_id: msmeId,
      },
    });

    if (!asset) {
      throw new Error(`Asset '${assetId}' not found`);
    }

    const updated = await client.vaultAsset.update({
      where: { id: asset.id },
      data: {
        archived_flag: false,
        status: 'VERIFIED',
        lifecycle_state: 'ACTIVE',
      },
    });

    await client.vaultRetentionEvent.create({
      data: {
        msme_id: msmeId,
        asset_id: asset.id,
        event_type: 'RESTORED',
        summary: `Asset '${asset.title}' restored from archive`,
        actor_id: restoredBy,
      },
    });

    return updated;
  }

  /**
   * List Archived Assets
   */
  static async listArchivedAssets(msmeId = 1, client = defaultPrisma) {
    return await client.vaultAsset.findMany({
      where: { msme_id: msmeId, archived_flag: true },
      include: { archive_records: true },
      orderBy: { updated_at: 'desc' },
    });
  }
}

module.exports = ArchiveService;
