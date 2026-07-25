/**
 * VersionComparisonEngine.js
 * Side-by-side Comparison Engine for Document Versions & Metadata (Phase 10.2).
 */

const VersionManager = require('./VersionManager');
const MetadataEvolutionEngine = require('./MetadataEvolutionEngine');

class VersionComparisonEngine {
  /**
   * Compare two versions side by side and generate human-readable diff report
   */
  static async compareVersions(assetId, versionA, versionB) {
    const [vA, vB] = await Promise.all([
      VersionManager.getVersionByNumber(assetId, versionA),
      VersionManager.getVersionByNumber(assetId, versionB),
    ]);

    if (!vA || !vB) {
      throw new Error(`One or both versions ('${versionA}', '${versionB}') not found for asset '${assetId}'.`);
    }

    const fieldDeltas = MetadataEvolutionEngine.computeMetadataDeltas(
      vA.metadata_snapshot || {},
      vB.metadata_snapshot || {}
    );

    const isFileChanged = vA.checksum !== vB.checksum;

    const summary = {
      versionA: {
        versionNumber: vA.version_number,
        title: vA.title,
        status: vA.status,
        changedBy: vA.changed_by,
        createdAt: vA.created_at,
        checksum: vA.checksum,
        fileSize: vA.file_size,
      },
      versionB: {
        versionNumber: vB.version_number,
        title: vB.title,
        status: vB.status,
        changedBy: vB.changed_by,
        createdAt: vB.created_at,
        checksum: vB.checksum,
        fileSize: vB.file_size,
      },
      isFileChanged,
      totalChangesCount: fieldDeltas.length + (isFileChanged ? 1 : 0),
      fieldDeltas,
      humanReadableSummary: isFileChanged
        ? `Document binary file replaced between ${versionA} and ${versionB} with ${fieldDeltas.length} metadata field modification(s).`
        : `${fieldDeltas.length} metadata field modification(s) recorded between ${versionA} and ${versionB}.`,
    };

    return summary;
  }
}

module.exports = VersionComparisonEngine;
