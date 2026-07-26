/**
 * CollaborationFeedService.js
 * Timeline Activity Feed & Platform Notification Integration for Enterprise Vault (Phase 10.4).
 */

const defaultPrisma = require('../../utils/prismaClient');

class CollaborationFeedService {
  /**
   * Fetch filterable activity events for an asset or across workspace
   */
  static async getActivityFeed({ assetId, eventType, limit = 50, msmeId = 1 }, client = defaultPrisma) {
    const where = { msme_id: msmeId };

    if (assetId) {
      const asset = await client.vaultAsset.findFirst({
        where: {
          OR: [
            { asset_id: assetId },
            { id: isNaN(Number(assetId)) ? -1 : Number(assetId) },
          ],
          msme_id: msmeId,
        },
      });
      if (asset) where.asset_id = asset.id;
    }

    if (eventType && eventType !== 'ALL') {
      where.event_type = eventType.toUpperCase();
    }

    return await client.vaultActivity.findMany({
      where,
      include: { asset: { select: { asset_id: true, title: true, original_file_name: true } } },
      orderBy: { created_at: 'desc' },
      take: Number(limit),
    });
  }

  /**
   * Broadcast notification payload hook to Notification System
   */
  static async triggerNotificationHook({ recipientId, eventType, title, message, metadata = {}, msmeId = 1 }) {
    console.log(`[NotificationHook] Event '${eventType}' -> Recipient '${recipientId}': ${title} - ${message}`);
    return {
      delivered: true,
      recipientId,
      eventType,
      title,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = CollaborationFeedService;
