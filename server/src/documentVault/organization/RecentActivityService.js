/**
 * RecentActivityService.js
 * Log Activity, Pinned Items, Favorites, & Recent Searches (Phase 10.3).
 */

const defaultPrisma = require('../../utils/prismaClient');

class RecentActivityService {
  /**
   * Log User Activity (VIEWED, UPLOADED, MODIFIED, DOWNLOADED, SEARCHED)
   */
  static async logActivity({ userId, assetId, activityType = 'VIEWED', details = {}, msmeId = 1 }, client = defaultPrisma) {
    const asset = await client.vaultAsset.findFirst({
      where: { OR: [{ asset_id: assetId }, { id: isNaN(Number(assetId)) ? -1 : Number(assetId) }] },
    });

    if (!asset) return null;

    return await client.vaultRecentActivity.create({
      data: {
        msme_id: msmeId,
        user_id: String(userId || 'ANONYMOUS'),
        asset_id: asset.id,
        activity_type: activityType,
        details,
      },
    });
  }

  /**
   * Get User Recent Activities
   */
  static async getRecentActivities(userId, msmeId = 1, limit = 20, client = defaultPrisma) {
    const records = await client.vaultRecentActivity.findMany({
      where: { msme_id: msmeId, user_id: String(userId || 'ANONYMOUS') },
      include: { asset: true },
      orderBy: { created_at: 'desc' },
      take: limit,
    });

    return records.map(r => ({
      id: r.id,
      activityType: r.activity_type,
      timestamp: r.created_at,
      asset: r.asset,
    }));
  }

  /**
   * Toggle Favorite or Pinned Asset for User
   */
  static async toggleFavorite({ userId, assetId, isPinned = false, msmeId = 1 }, client = defaultPrisma) {
    const asset = await client.vaultAsset.findFirst({
      where: { OR: [{ asset_id: assetId }, { id: isNaN(Number(assetId)) ? -1 : Number(assetId) }] },
    });

    if (!asset) throw new Error(`Vault Asset '${assetId}' not found for favoriting.`);

    const userStr = String(userId || 'ANONYMOUS');
    const existing = await client.vaultFavorite.findFirst({
      where: { user_id: userStr, asset_id: asset.id },
    });

    if (existing) {
      await client.vaultFavorite.delete({ where: { id: existing.id } });
      return { favorited: false, assetId };
    }

    const fav = await client.vaultFavorite.create({
      data: {
        msme_id: msmeId,
        user_id: userStr,
        asset_id: asset.id,
        is_pinned: isPinned,
      },
    });

    return { favorited: true, favoriteId: fav.id, assetId };
  }

  /**
   * Get User Favorites and Pinned Items
   */
  static async getFavorites(userId, msmeId = 1, client = defaultPrisma) {
    const records = await client.vaultFavorite.findMany({
      where: { msme_id: msmeId, user_id: String(userId || 'ANONYMOUS') },
      include: { asset: true },
      orderBy: [{ is_pinned: 'desc' }, { created_at: 'desc' }],
    });

    return records.map(f => ({
      id: f.id,
      isPinned: f.is_pinned,
      createdAt: f.created_at,
      asset: f.asset,
    }));
  }
}

module.exports = RecentActivityService;
