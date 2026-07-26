/**
 * DispositionService.js
 * Governed Disposition & Destruction Management for Enterprise Vault (Phase 10.5).
 */

const defaultPrisma = require('../../utils/prismaClient');
const LegalHoldService = require('./LegalHoldService');

class DispositionService {
  /**
   * Queue Asset for Disposition Review
   */
  static async queueForDisposition({ assetId, dispositionType = 'SECURE_DESTROY', msmeId = 1 }, client = defaultPrisma) {
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

    const holdCheck = await LegalHoldService.canDeleteOrDispose(asset.asset_id, msmeId, client);
    if (!holdCheck.allowed) {
      throw new Error(holdCheck.reason);
    }

    const record = await client.vaultDispositionRecord.create({
      data: {
        msme_id: msmeId,
        asset_id: asset.id,
        disposition_type: dispositionType,
        status: 'PENDING_REVIEW',
      },
    });

    await client.vaultAsset.update({
      where: { id: asset.id },
      data: {
        disposition_status: 'PENDING_REVIEW',
        lifecycle_state: 'PENDING_DISPOSITION',
      },
    });

    return record;
  }

  /**
   * Review Disposition (Approve or Reject)
   */
  static async reviewDisposition({ dispositionId, approved, reviewerId, notes, msmeId = 1 }, client = defaultPrisma) {
    const record = await client.vaultDispositionRecord.findFirst({
      where: {
        OR: [
          { disposition_id: dispositionId },
          { id: isNaN(Number(dispositionId)) ? -1 : Number(dispositionId) },
        ],
        msme_id: msmeId,
      },
      include: { asset: true },
    });

    if (!record) {
      throw new Error(`Disposition Record '${dispositionId}' not found`);
    }

    const newStatus = approved ? 'APPROVED' : 'REJECTED';
    const updated = await client.vaultDispositionRecord.update({
      where: { id: record.id },
      data: {
        status: newStatus,
        reviewed_by: String(reviewerId),
        reviewed_at: new Date(),
        review_notes: notes,
      },
    });

    await client.vaultAsset.update({
      where: { id: record.asset_id },
      data: { disposition_status: newStatus },
    });

    await client.vaultRetentionEvent.create({
      data: {
        msme_id: msmeId,
        asset_id: record.asset_id,
        event_type: approved ? 'DISPOSITION_APPROVED' : 'DISPOSITION_REJECTED',
        summary: `Disposition ${newStatus} by reviewer '${reviewerId}'`,
        actor_id: String(reviewerId),
      },
    });

    return updated;
  }

  /**
   * Execute Approved Disposition (Secure Logical Destruction)
   */
  static async executeDisposition({ dispositionId, executorId = 'SYSTEM', msmeId = 1 }, client = defaultPrisma) {
    const record = await client.vaultDispositionRecord.findFirst({
      where: {
        OR: [
          { disposition_id: dispositionId },
          { id: isNaN(Number(dispositionId)) ? -1 : Number(dispositionId) },
        ],
        msme_id: msmeId,
      },
      include: { asset: true },
    });

    if (!record || record.status !== 'APPROVED') {
      throw new Error(`Disposition Record '${dispositionId}' is not approved for execution`);
    }

    const holdCheck = await LegalHoldService.canDeleteOrDispose(record.asset.asset_id, msmeId, client);
    if (!holdCheck.allowed) {
      throw new Error(holdCheck.reason);
    }

    const updatedRecord = await client.vaultDispositionRecord.update({
      where: { id: record.id },
      data: {
        status: 'EXECUTED',
        executed_by: String(executorId),
        executed_at: new Date(),
      },
    });

    await client.vaultAsset.update({
      where: { id: record.asset_id },
      data: {
        deleted_flag: true,
        disposition_status: 'DISPOSED',
        lifecycle_state: 'DESTROYED',
      },
    });

    await client.vaultRetentionEvent.create({
      data: {
        msme_id: msmeId,
        asset_id: record.asset_id,
        event_type: 'DISPOSED',
        summary: `Asset '${record.asset.title}' securely disposed`,
        actor_id: String(executorId),
      },
    });

    return updatedRecord;
  }

  /**
   * List Disposition Queue
   */
  static async listDispositionQueue(msmeId = 1, client = defaultPrisma) {
    return await client.vaultDispositionRecord.findMany({
      where: { msme_id: msmeId },
      include: { asset: true },
      orderBy: { created_at: 'desc' },
    });
  }
}

module.exports = DispositionService;
