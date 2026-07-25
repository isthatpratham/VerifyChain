/**
 * DocumentLineageService.js
 * Document Ancestry & Genealogy Graph Service (Phase 10.2).
 */

const defaultPrisma = require('../../utils/prismaClient');

class DocumentLineageService {
  /**
   * Get complete document lineage history graph
   */
  static async getDocumentLineage(assetId, client = defaultPrisma) {
    const asset = await client.vaultAsset.findUnique({ where: { asset_id: assetId } });
    if (!asset) throw new Error(`Vault Asset '${assetId}' not found.`);

    const lineages = await client.vaultDocumentLineage.findMany({
      where: { asset_id: asset.id },
      orderBy: { created_at: 'asc' },
    });

    const nodeMap = new Map();

    nodeMap.set('v1.0', {
      versionNumber: 'v1.0',
      parentVersion: null,
      lineageType: 'ORIGINAL_INGESTION',
      createdAt: asset.created_at,
    });

    for (const l of lineages) {
      nodeMap.set(l.child_version_number, {
        versionNumber: l.child_version_number,
        parentVersion: l.parent_version_number,
        lineageType: l.lineage_type,
        description: l.description,
        createdAt: l.created_at,
      });
    }

    return {
      assetId: asset.asset_id,
      title: asset.title,
      currentVersion: asset.current_version,
      totalNodesCount: nodeMap.size,
      lineageNodes: Array.from(nodeMap.values()),
    };
  }
}

module.exports = DocumentLineageService;
