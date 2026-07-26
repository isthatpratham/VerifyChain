/**
 * DocumentWatchService.js
 * Subscription & Document Watcher Management for Enterprise Vault (Phase 10.4).
 */

const defaultPrisma = require('../../utils/prismaClient');

class DocumentWatchService {
  /**
   * Toggle or Add Watcher subscription
   */
  static async toggleWatch({ assetId, userId, msmeId = 1 }, client = defaultPrisma) {
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

    const existing = await client.vaultWatcher.findUnique({
      where: {
        asset_id_user_id: {
          asset_id: asset.id,
          user_id: String(userId),
        },
      },
    });

    if (existing) {
      await client.vaultWatcher.delete({ where: { id: existing.id } });
      return { isWatching: false, assetId: asset.asset_id, userId };
    }

    const watcher = await client.vaultWatcher.create({
      data: {
        msme_id: msmeId,
        asset_id: asset.id,
        user_id: String(userId),
      },
    });

    await client.vaultActivity.create({
      data: {
        msme_id: msmeId,
        asset_id: asset.id,
        actor_id: String(userId),
        event_type: 'WATCHER_ADDED',
        summary: `User '${userId}' subscribed to document updates`,
      },
    });

    return { isWatching: true, watcherId: watcher.id, assetId: asset.asset_id, userId };
  }

  /**
   * List document watchers
   */
  static async getWatchers(assetId, msmeId = 1, client = defaultPrisma) {
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

    return await client.vaultWatcher.findMany({
      where: { asset_id: asset.id, msme_id: msmeId },
    });
  }
}

module.exports = DocumentWatchService;
