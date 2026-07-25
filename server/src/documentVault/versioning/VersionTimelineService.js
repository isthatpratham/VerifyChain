/**
 * VersionTimelineService.js
 * Chronological History Timeline Builder for Document Vault Assets (Phase 10.2).
 */

const defaultPrisma = require('../../utils/prismaClient');
const VersionManager = require('./VersionManager');

class VersionTimelineService {
  /**
   * Build unified chronological timeline containing versions, status transitions, and audit events
   */
  static async getAssetTimeline(assetId, client = defaultPrisma) {
    const asset = await client.vaultAsset.findUnique({ where: { asset_id: assetId } });
    if (!asset) throw new Error(`Vault Asset '${assetId}' not found.`);

    const [versions, audits, lineages] = await Promise.all([
      client.vaultDocumentVersion.findMany({
        where: { asset_id: asset.id },
        orderBy: { created_at: 'asc' },
        include: { changes: true },
      }),
      client.vaultAssetAudit.findMany({
        where: { asset_id: asset.id },
        orderBy: { created_at: 'asc' },
      }),
      client.vaultDocumentLineage.findMany({
        where: { asset_id: asset.id },
        orderBy: { created_at: 'asc' },
      }),
    ]);

    const timelineEvents = [];

    // Map Versions
    for (const v of versions) {
      timelineEvents.push({
        id: `ver_${v.id}`,
        type: 'VERSION_CREATED',
        timestamp: v.created_at,
        actor: v.changed_by,
        versionNumber: v.version_number,
        title: v.title,
        status: v.status,
        tag: v.version_tag,
        summary: v.change_summary,
        aiGenerated: v.ai_generated_flag,
        changesCount: v.changes.length,
      });
    }

    // Map Audits
    for (const a of audits) {
      timelineEvents.push({
        id: `aud_${a.id}`,
        type: a.action,
        timestamp: a.created_at,
        actor: a.actor_id,
        summary: `Action '${a.action}' performed on asset`,
        details: a.details,
      });
    }

    // Sort chronologically
    timelineEvents.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    return {
      assetId: asset.asset_id,
      currentVersion: asset.current_version,
      totalVersionsCount: versions.length,
      totalEventsCount: timelineEvents.length,
      lineages,
      events: timelineEvents,
    };
  }
}

module.exports = VersionTimelineService;
