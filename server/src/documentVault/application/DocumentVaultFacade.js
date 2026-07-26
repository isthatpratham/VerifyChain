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
const FolderService = require('../organization/FolderService');
const CollectionService = require('../organization/CollectionService');
const TagService = require('../organization/TagService');
const ClassificationService = require('../organization/ClassificationService');
const RecentActivityService = require('../organization/RecentActivityService');
const SavedSearchService = require('../organization/SavedSearchService');
const BulkOperationsService = require('../organization/BulkOperationsService');
const SearchEngine = require('../search/SearchEngine');

const VaultPermissionEngine = require('../collaboration/VaultPermissionEngine');
const SharingService = require('../collaboration/SharingService');
const CommentService = require('../collaboration/CommentService');
const DocumentWatchService = require('../collaboration/DocumentWatchService');
const ReviewRequestService = require('../collaboration/ReviewRequestService');
const CollaborationFeedService = require('../collaboration/CollaborationFeedService');

const RecordsManagementService = require('../records/RecordsManagementService');
const RetentionPolicyEngine = require('../records/RetentionPolicyEngine');
const PolicyAssignmentService = require('../records/PolicyAssignmentService');
const LegalHoldService = require('../records/LegalHoldService');
const ArchiveService = require('../records/ArchiveService');
const DispositionService = require('../records/DispositionService');
const GovernanceDashboardService = require('../records/GovernanceDashboardService');

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
    return fontSearch(filterParams);
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

  static async createVersion(params) {
    return await VersionManager.createVersion(params);
  }

  static async listVersions(assetId) {
    return await VersionManager.getVersionHistory(assetId);
  }

  static async getVersionHistory(assetId) {
    return await VersionManager.getVersionHistory(assetId);
  }

  static async getVersionByNumber(assetId, versionNumber) {
    return await VersionManager.getVersionByNumber(assetId, versionNumber);
  }

  static async compareVersions(assetId, versionA, versionB) {
    return await VersionComparisonEngine.compareVersions(assetId, versionA, versionB);
  }

  static async getAssetTimeline(assetId) {
    return await VersionTimelineService.getAssetTimeline(assetId);
  }

  static async rollbackToVersion(assetId, targetVersionNumber, user = null, reason = null) {
    return await RollbackManager.rollbackToVersion(assetId, targetVersionNumber, user, reason);
  }

  static async getDocumentLineage(assetId) {
    return await DocumentLineageService.getDocumentLineage(assetId);
  }

  // ─── PHASE 10.3 SMART ORGANIZATION & ENTERPRISE SEARCH ──────────────────

  static async createFolder(params) {
    return await FolderService.createFolder(params);
  }

  static async getFolderTree(msmeId = 1) {
    return await FolderService.getFolderTree(msmeId);
  }

  static async getFolderDetails(folderId, msmeId = 1) {
    return await FolderService.getFolderDetails(folderId, msmeId);
  }

  static async updateFolder(folderId, params) {
    return await FolderService.updateFolder(folderId, params);
  }

  static async archiveFolder(folderId) {
    return await FolderService.archiveFolder(folderId);
  }

  static async listCollections(msmeId = 1) {
    return await CollectionService.listCollections(msmeId);
  }

  static async evaluateCollection(collectionId, msmeId = 1) {
    return await CollectionService.evaluateCollection(collectionId, msmeId);
  }

  static async createCollection(params) {
    return await CollectionService.createCollection(params);
  }

  static async tagAssets(params) {
    return await TagService.tagAssets(params);
  }

  static async untagAssets(params) {
    return await TagService.untagAssets(params);
  }

  static async getTags(msmeId = 1) {
    return await TagService.getTags(msmeId);
  }

  static async getTaxonomy(msmeId = 1) {
    return await ClassificationService.getTaxonomy(msmeId);
  }

  static async logActivity(params) {
    return await RecentActivityService.logActivity(params);
  }

  static async getRecentActivities(userId, msmeId = 1, limit = 20) {
    return await RecentActivityService.getRecentActivities(userId, msmeId, limit);
  }

  static async toggleFavorite(params) {
    return await RecentActivityService.toggleFavorite(params);
  }

  static async getFavorites(userId, msmeId = 1) {
    return await RecentActivityService.getFavorites(userId, msmeId);
  }

  static async saveSearch(params) {
    return await SavedSearchService.saveSearch(params);
  }

  static async listSavedSearches(userId, msmeId = 1) {
    return await SavedSearchService.listSavedSearches(userId, msmeId);
  }

  static async deleteSavedSearch(searchId, userId) {
    return await SavedSearchService.deleteSavedSearch(searchId, userId);
  }

  static async bulkMove(params) {
    return await BulkOperationsService.bulkMove(params);
  }

  static async bulkCategorize(params) {
    return await BulkOperationsService.bulkCategorize(params);
  }

  static async bulkLifecycleAction(params) {
    return await BulkOperationsService.bulkLifecycleAction(params);
  }

  static async bulkExportMetadata(params) {
    return await BulkOperationsService.bulkExportMetadata(params);
  }

  static async advancedSearch(params) {
    return await SearchEngine.search(params);
  }

  // ─── PHASE 10.4 ENTERPRISE COLLABORATION & PERMISSIONS FACADE METHODS ─────

  static async evaluateAccess(params) {
    return await VaultPermissionEngine.evaluateAccess(params);
  }

  static async shareAsset(params) {
    return await SharingService.shareAsset(params);
  }

  static async revokeShare(shareId, msmeId = 1) {
    return await SharingService.revokeShare(shareId, msmeId);
  }

  static async listAssetShares(assetId, msmeId = 1) {
    return await SharingService.listAssetShares(assetId, msmeId);
  }

  static async listIncomingShares(userId, msmeId = 1) {
    return await SharingService.listIncomingShares(userId, msmeId);
  }

  static async addComment(params) {
    return await CommentService.addComment(params);
  }

  static async getComments(assetId, msmeId = 1) {
    return await CommentService.getComments(assetId, msmeId);
  }

  static async resolveComment(params) {
    return await CommentService.resolveComment(params);
  }

  static async toggleWatch(params) {
    return await DocumentWatchService.toggleWatch(params);
  }

  static async getWatchers(assetId, msmeId = 1) {
    return await DocumentWatchService.getWatchers(assetId, msmeId);
  }

  static async createReviewRequest(params) {
    return await ReviewRequestService.createReviewRequest(params);
  }

  static async updateReviewStatus(params) {
    return await ReviewRequestService.updateReviewStatus(params);
  }

  static async getAssetReviewRequests(assetId, msmeId = 1) {
    return await ReviewRequestService.getAssetReviewRequests(assetId, msmeId);
  }

  static async getActivityFeed(params) {
    return await CollaborationFeedService.getActivityFeed(params);
  }

  // ─── PHASE 10.5 ENTERPRISE RECORDS MANAGEMENT & GOVERNANCE FACADE METHODS ─

  static async transitionLifecycle(params) {
    return await RecordsManagementService.transitionLifecycle(params);
  }

  static async createPolicy(params) {
    return await RetentionPolicyEngine.createPolicy(params);
  }

  static async listPolicies(msmeId = 1) {
    return await RetentionPolicyEngine.listPolicies(msmeId);
  }

  static async assignPolicy(params) {
    return await PolicyAssignmentService.assignPolicy(params);
  }

  static async createLegalHold(params) {
    return await LegalHoldService.createLegalHold(params);
  }

  static async releaseLegalHold(params) {
    return await LegalHoldService.releaseLegalHold(params);
  }

  static async listLegalHolds(msmeId = 1) {
    return await LegalHoldService.listLegalHolds(msmeId);
  }

  static async archiveAsset(params, user = null) {
    const assetId = typeof params === 'object' && params !== null ? (params.assetId || params.id) : params;
    await ArchiveService.archiveAsset(params);
    return await this.getAssetById(assetId, user || (params && params.user));
  }

  static async restoreAsset(params, user = null) {
    const assetId = typeof params === 'object' && params !== null ? (params.assetId || params.id) : params;
    await ArchiveService.restoreAsset(params);
    return await this.getAssetById(assetId, user || (params && params.user));
  }

  static async listArchivedAssets(msmeId = 1) {
    return await ArchiveService.listArchivedAssets(msmeId);
  }

  static async queueForDisposition(params) {
    return await DispositionService.queueForDisposition(params);
  }

  static async reviewDisposition(params) {
    return await DispositionService.reviewDisposition(params);
  }

  static async executeDisposition(params) {
    return await DispositionService.executeDisposition(params);
  }

  static async listDispositionQueue(msmeId = 1) {
    return await DispositionService.listDispositionQueue(msmeId);
  }

  static async getGovernanceMetrics(msmeId = 1) {
    return await GovernanceDashboardService.getGovernanceMetrics(msmeId);
  }

  static async generateReport(params) {
    return await GovernanceDashboardService.generateReport(params);
  }
}

function fontSearch(filterParams) {
  return SearchEngine.search(filterParams);
}

module.exports = DocumentVaultFacade;
