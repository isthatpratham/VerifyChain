/**
 * BulkOperationsService.js
 * Bulk Operations Service for Enterprise Vault Assets (Phase 10.3).
 * Supports bulk move, bulk tag, bulk categorize, bulk archive, bulk restore, bulk delete, and metadata export.
 */

const defaultPrisma = require('../../utils/prismaClient');
const VaultAuditPublisher = require('../infrastructure/VaultAuditPublisher');

class BulkOperationsService {
  /**
   * Bulk Move Assets to a Target Folder
   */
  static async bulkMove({ assetIds, targetFolderId, msmeId = 1, user = null }, client = defaultPrisma) {
    if (!assetIds || !Array.isArray(assetIds) || assetIds.length === 0) {
      throw new Error('At least one assetId is required for bulk move.');
    }

    let folderRecord = null;
    if (targetFolderId) {
      folderRecord = await client.vaultFolder.findFirst({
        where: { OR: [{ folder_id: targetFolderId }, { id: isNaN(Number(targetFolderId)) ? -1 : Number(targetFolderId) }] },
      });
      if (!folderRecord) throw new Error(`Target folder '${targetFolderId}' not found.`);
    }

    const assets = await client.vaultAsset.findMany({
      where: { asset_id: { in: assetIds }, msme_id: msmeId },
    });

    const res = await client.vaultAsset.updateMany({
      where: { asset_id: { in: assetIds }, msme_id: msmeId },
      data: { folder_id: folderRecord ? folderRecord.id : null, updated_by: user?.id ? `USER_${user.id}` : 'SYSTEM' },
    });

    await VaultAuditPublisher.publishVaultEvent({
      action: 'VAULT_BULK_MOVE',
      actorId: user?.id ? `USER_${user.id}` : 'SYSTEM',
      msmeId,
      details: { movedCount: res.count, targetFolderId: folderRecord?.folder_id },
    });

    return { movedCount: res.count, folderName: folderRecord?.name || 'Root' };
  }

  /**
   * Bulk Categorize Assets
   */
  static async bulkCategorize({ assetIds, category, documentType, msmeId = 1, user = null }, client = defaultPrisma) {
    if (!assetIds || !Array.isArray(assetIds) || assetIds.length === 0) {
      throw new Error('At least one assetId is required for bulk categorize.');
    }

    const updateData = {};
    if (category) updateData.category = category;
    if (documentType) updateData.document_type = documentType;

    const res = await client.vaultAsset.updateMany({
      where: { asset_id: { in: assetIds }, msme_id: msmeId },
      data: updateData,
    });

    return { categorizedCount: res.count, category, documentType };
  }

  /**
   * Bulk Archive / Restore / Delete
   */
  static async bulkLifecycleAction({ assetIds, action = 'ARCHIVE', msmeId = 1, user = null }, client = defaultPrisma) {
    if (!assetIds || !Array.isArray(assetIds) || assetIds.length === 0) {
      throw new Error('At least one assetId is required for bulk action.');
    }

    const updateData = {};
    if (action.toUpperCase() === 'ARCHIVE') {
      updateData.status = 'ARCHIVED';
      updateData.archived_flag = true;
    } else if (action.toUpperCase() === 'RESTORE') {
      updateData.status = 'VERIFIED';
      updateData.archived_flag = false;
      updateData.deleted_flag = false;
    } else if (action.toUpperCase() === 'DELETE') {
      updateData.status = 'DELETED';
      updateData.deleted_flag = true;
    }

    const res = await client.vaultAsset.updateMany({
      where: { asset_id: { in: assetIds }, msme_id: msmeId },
      data: updateData,
    });

    return { affectedCount: res.count, action };
  }

  /**
   * Bulk Export Metadata
   */
  static async bulkExportMetadata({ assetIds, msmeId = 1 }, client = defaultPrisma) {
    const assets = await client.vaultAsset.findMany({
      where: { asset_id: { in: assetIds }, msme_id: msmeId },
      include: { versions: true, tags: true },
    });

    return assets.map(a => ({
      assetId: a.asset_id,
      title: a.title,
      originalFileName: a.original_file_name,
      category: a.category,
      documentType: a.document_type,
      currentVersion: a.current_version,
      status: a.status,
      checksum: a.checksum,
      fileSize: a.file_size,
      mimeType: a.mime_type,
      metadata: a.metadata,
      createdAt: a.created_at,
    }));
  }
}

module.exports = BulkOperationsService;
