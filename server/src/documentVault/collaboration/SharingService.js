/**
 * SharingService.js
 * Secure Internal Sharing & Access Management for Enterprise Vault (Phase 10.4).
 */

const defaultPrisma = require('../../utils/prismaClient');

class SharingService {
  /**
   * Share an asset internally with user/role/organization
   */
  static async shareAsset({ assetId, targetType, targetId, accessLevel = 'READ', note, expiresAt, sharedBy = 'SYSTEM', msmeId = 1 }, client = defaultPrisma) {
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
      throw new Error(`Asset '${assetId}' not found in MSME workspace '${msmeId}'`);
    }

    const share = await client.vaultShare.create({
      data: {
        msme_id: msmeId,
        asset_id: asset.id,
        target_type: targetType.toUpperCase(),
        target_id: String(targetId),
        access_level: accessLevel.toUpperCase(),
        note,
        expires_at: expiresAt ? new Date(expiresAt) : null,
        shared_by: sharedBy,
      },
    });

    // Log Activity
    await client.vaultActivity.create({
      data: {
        msme_id: msmeId,
        asset_id: asset.id,
        actor_id: sharedBy,
        event_type: 'SHARE_CREATED',
        summary: `Asset '${asset.title}' shared with ${targetType} '${targetId}' (${accessLevel})`,
        details: { share_id: share.share_id, targetType, targetId, accessLevel },
      },
    });

    return share;
  }

  /**
   * Revoke an active share grant
   */
  static async revokeShare(shareId, msmeId = 1, client = defaultPrisma) {
    const share = await client.vaultShare.findFirst({
      where: { share_id: shareId, msme_id: msmeId },
    });

    if (!share) {
      throw new Error(`Share '${shareId}' not found`);
    }

    const updated = await client.vaultShare.update({
      where: { id: share.id },
      data: { is_revoked: true },
    });

    await client.vaultActivity.create({
      data: {
        msme_id: msmeId,
        asset_id: share.asset_id,
        actor_id: 'SYSTEM',
        event_type: 'SHARE_REVOKED',
        summary: `Share '${shareId}' revoked`,
      },
    });

    return updated;
  }

  /**
   * List active & revoked share grants for an asset
   */
  static async listAssetShares(assetId, msmeId = 1, client = defaultPrisma) {
    const asset = await client.vaultAsset.findFirst({
      where: {
        OR: [
          { asset_id: assetId },
          { id: isNaN(Number(assetId)) ? -1 : Number(assetId) },
        ],
        msme_id: msmeId,
      },
    });

    if (!asset) return [];

    return await client.vaultShare.findMany({
      where: { asset_id: asset.id, msme_id: msmeId },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * List documents shared with specific user
   */
  static async listIncomingShares(userId, msmeId = 1, client = defaultPrisma) {
    return await client.vaultShare.findMany({
      where: {
        msme_id: msmeId,
        is_revoked: false,
        OR: [
          { target_type: 'USER', target_id: String(userId) },
          { target_type: 'ORGANIZATION' },
        ],
      },
      include: { asset: true },
      orderBy: { created_at: 'desc' },
    });
  }
}

module.exports = SharingService;
