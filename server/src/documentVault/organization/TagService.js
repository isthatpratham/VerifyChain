/**
 * TagService.js
 * Document Tagging & Bulk Tag Management Service (Phase 10.3).
 */

const defaultPrisma = require('../../utils/prismaClient');

class TagService {
  /**
   * Create or Retrieve Tag for MSME
   */
  static async getOrCreateTag(tagName, color = '#3B82F6', msmeId = 1, client = defaultPrisma) {
    const cleanName = tagName.trim().toUpperCase();
    let tag = await client.vaultDocumentTag.findFirst({
      where: { msme_id: msmeId, name: cleanName },
    });

    if (!tag) {
      tag = await client.vaultDocumentTag.create({
        data: {
          msme_id: msmeId,
          name: cleanName,
          color,
          usage_count: 0,
        },
      });
    }

    return tag;
  }

  /**
   * Tag single or multiple assets (Bulk Tagging)
   */
  static async tagAssets({ assetIds, tags, color = '#3B82F6', msmeId = 1 }, client = defaultPrisma) {
    if (!assetIds || !Array.isArray(assetIds) || assetIds.length === 0) {
      throw new Error('At least one assetId is required for tagging.');
    }
    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      throw new Error('At least one tag string is required.');
    }

    const assets = await client.vaultAsset.findMany({
      where: { asset_id: { in: assetIds }, msme_id: msmeId },
    });

    const tagRecords = [];
    for (const tName of tags) {
      const tagObj = await this.getOrCreateTag(tName, color, msmeId, client);
      tagRecords.push(tagObj);
    }

    let appliedCount = 0;
    for (const asset of assets) {
      for (const tagObj of tagRecords) {
        try {
          await client.vaultAssetTag.create({
            data: {
              asset_id: asset.id,
              tag_id: tagObj.id,
            },
          });
          appliedCount += 1;
        } catch (e) {
          // Ignore duplicate tag join error
        }
      }
    }

    // Update tag usage counts
    for (const tagObj of tagRecords) {
      const count = await client.vaultAssetTag.count({ where: { tag_id: tagObj.id } });
      await client.vaultDocumentTag.update({
        where: { id: tagObj.id },
        data: { usage_count: count },
      });
    }

    return {
      taggedAssetsCount: assets.length,
      tagsApplied: tagRecords.map(t => t.name),
      associationsCreated: appliedCount,
    };
  }

  /**
   * Untag single or multiple assets
   */
  static async untagAssets({ assetIds, tags, msmeId = 1 }, client = defaultPrisma) {
    const assets = await client.vaultAsset.findMany({
      where: { asset_id: { in: assetIds }, msme_id: msmeId },
    });

    const cleanTags = tags.map(t => t.trim().toUpperCase());
    const tagObjs = await client.vaultDocumentTag.findMany({
      where: { msme_id: msmeId, name: { in: cleanTags } },
    });

    const tagIds = tagObjs.map(t => t.id);
    const assetDbIds = assets.map(a => a.id);

    const deleted = await client.vaultAssetTag.deleteMany({
      where: {
        asset_id: { in: assetDbIds },
        tag_id: { in: tagIds },
      },
    });

    return { removedAssociationsCount: deleted.count };
  }

  /**
   * Get Tag Analytics and List for MSME
   */
  static async getTags(msmeId = 1, client = defaultPrisma) {
    return await client.vaultDocumentTag.findMany({
      where: { msme_id: msmeId },
      orderBy: [{ usage_count: 'desc' }, { name: 'asc' }],
    });
  }
}

module.exports = TagService;
