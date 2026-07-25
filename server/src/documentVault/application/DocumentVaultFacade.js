/**
 * DocumentVaultFacade.js
 * Master Application Facade for Phase 10.1 Enterprise Document Vault.
 */

const DocumentVaultService = require('./DocumentVaultService');
const VaultRetrievalService = require('../retrieval/VaultRetrievalService');
const VersionManager = require('../versioning/VersionManager');
const VersionComparisonEngine = require('../versioning/VersionComparisonEngine');
const VersionTimelineService = require('../versioning/VersionTimelineService');
const RollbackManager = require('../versioning/RollbackManager');
const DocumentLineageService = require('../versioning/DocumentLineageService');

class DocumentVaultFacade {
  /**
   * Ingest and store file buffer as a Vault Asset
   */
  static async ingestAsset(params) {
    return await DocumentVaultService.ingestAsset(params);
  }

  /**
   * Search / Filter Repository Assets
   */
  static async searchAssets(filterParams) {
    return await VaultRetrievalService.searchAssets(filterParams);
  }

  /**
   * Get Asset Details by assetId
   */
  static async getAssetById(assetId, user = null) {
    return await VaultRetrievalService.getAssetById(assetId, user);
  }

  /**
   * Secure Asset Download Stream
   */
  static async downloadAsset(assetId, user = null) {
    return await VaultRetrievalService.downloadAsset(assetId, user);
  }

  /**
   * Update Asset Lifecycle Status
   */
  static async updateAssetStatus(assetId, newStatus, user = null, notes = null) {
    return await DocumentVaultService.updateAssetStatus(assetId, newStatus, user, notes);
  }

  /**
   * Update Asset Metadata
   */
  static async updateMetadata(assetId, metadataFields, user = null) {
    return await DocumentVaultService.updateMetadata(assetId, metadataFields, user);
  }

  /**
   * Archive Asset
   */
  static async archiveAsset(assetId, user = null) {
    return await DocumentVaultService.archiveAsset(assetId, user);
  }

  /**
   * Restore Asset
   */
  static async restoreAsset(assetId, user = null) {
    return await DocumentVaultService.restoreAsset(assetId, user);
  }

  /**
   * Soft Delete Asset
   */
  static async deleteAsset(assetId, user = null) {
    return await DocumentVaultService.deleteAsset(assetId, user);
  }

  /**
   * Repository Statistics & Storage Metrics
   */
  static async getRepositoryMetrics(msmeId = 1) {
    return await VaultRetrievalService.getRepositoryMetrics(msmeId);
  }

  // ─── PHASE 10.2 VERSION CONTROL & METADATA INTELLIGENCE ────────────────────

  /**
   * Get Version History for Asset
   */
  static async getVersionHistory(assetId) {
    return await VersionManager.getVersionHistory(assetId);
  }

  /**
   * Get Specific Version Snapshot
   */
  static async getVersionByNumber(assetId, versionNumber) {
    return await VersionManager.getVersionByNumber(assetId, versionNumber);
  }

  /**
   * Compare Two Versions Side-by-Side
   */
  static async compareVersions(assetId, versionA, versionB) {
    return await VersionComparisonEngine.compareVersions(assetId, versionA, versionB);
  }

  /**
   * Get Unified Chronological Timeline
   */
  static async getAssetTimeline(assetId) {
    return await VersionTimelineService.getAssetTimeline(assetId);
  }

  /**
   * Execute Soft Rollback to Historical Version
   */
  static async rollbackToVersion(assetId, targetVersionNumber, user = null, reason = null) {
    return await RollbackManager.rollbackToVersion(assetId, targetVersionNumber, user, reason);
  }

  /**
   * Get Document Lineage Graph
   */
  static async getDocumentLineage(assetId) {
    return await DocumentLineageService.getDocumentLineage(assetId);
  }
}

module.exports = DocumentVaultFacade;
