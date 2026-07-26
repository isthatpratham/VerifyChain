/**
 * documentVault.routes.js
 * REST API Routes for Phase 10.1 Enterprise Document Vault (/api/v1/vault).
 */

const express = require('express');
const { DocumentVault } = require('../../../documentVault');
const { requireScope } = require('../../../middleware/scopeAuth.middleware');
const { sendSuccess, sendError } = require('../../../utils/apiResponse');

const router = express.Router();

/**
 * Upload / Ingest File into Enterprise Document Vault
 * POST /api/v1/vault/assets
 */
router.post('/assets', requireScope('vault.upload'), async (req, res) => {
  try {
    const { title, displayName, originalFileName, mimeType, fileSize, contentBase64, category, documentType, complianceCategory, aiAnalysisReference, metadata } = req.body;
    
    const fileBuffer = contentBase64 
      ? Buffer.from(contentBase64, 'base64') 
      : Buffer.from(`Enterprise Document Payload for ${title || originalFileName || 'Asset'}`);

    const asset = await DocumentVault.ingestAsset({
      fileBuffer,
      fileName: originalFileName || 'document.pdf',
      mimeType: mimeType || 'application/pdf',
      title: title || originalFileName || 'New Vault Asset',
      displayName: displayName || title || originalFileName,
      documentType: documentType || 'BUSINESS_DOC',
      category: category || 'BUSINESS',
      complianceCategory: complianceCategory || null,
      aiAnalysisReference: aiAnalysisReference || null,
      msmeId: req.msmeId || req.user?.msmeId || 1,
      ownerId: req.user?.id || null,
      user: req.user,
      metadata: metadata || {},
    });

    return sendSuccess(res, { statusCode: 201, data: asset.toDict() });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'INGESTION_ERROR', message: 'Failed to ingest asset into document vault.', details: err.message });
  }
});

/**
 * List & Search Vault Assets
 * GET /api/v1/vault/assets
 */
router.get('/assets', requireScope('vault.read'), async (req, res) => {
  try {
    const msmeId = req.msmeId || req.user?.msmeId || req.query.msmeId || 1;
    const { category, status, documentType, complianceCategory, search, limit, offset } = req.query;

    const result = await DocumentVault.searchAssets({
      msmeId,
      category,
      status,
      documentType,
      complianceCategory,
      search,
      limit: limit || 20,
      offset: offset || 0,
    });

    return sendSuccess(res, {
      statusCode: 200,
      data: result.assets.map(a => a.toDict()),
      pagination: { total: result.total, limit: result.limit, offset: result.offset },
    });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'VAULT_SEARCH_ERROR', message: 'Failed to search document vault assets.', details: err.message });
  }
});

/**
 * Get Repository Storage Metrics & Overview
 * GET /api/v1/vault/metrics
 */
router.get('/metrics', requireScope('vault.read'), async (req, res) => {
  try {
    const msmeId = req.msmeId || req.user?.msmeId || req.query.msmeId || 1;
    const metrics = await DocumentVault.getRepositoryMetrics(msmeId);
    return sendSuccess(res, { statusCode: 200, data: metrics });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'METRICS_ERROR', message: 'Failed to fetch document vault metrics.', details: err.message });
  }
});

/**
 * Get Single Vault Asset Details
 * GET /api/v1/vault/assets/:assetId
 */
router.get('/assets/:assetId', requireScope('vault.read'), async (req, res) => {
  try {
    const asset = await DocumentVault.getAssetById(req.params.assetId, req.user);
    return sendSuccess(res, { statusCode: 200, data: asset.toDict() });
  } catch (err) {
    return sendError(res, { statusCode: 404, errorCode: 'ASSET_NOT_FOUND', message: err.message });
  }
});

/**
 * Download Secure Vault Asset File Binary
 * GET /api/v1/vault/assets/:assetId/download
 */
router.get('/assets/:assetId/download', requireScope('vault.read'), async (req, res) => {
  try {
    const { buffer, fileName, mimeType, checksum } = await DocumentVault.downloadAsset(req.params.assetId, req.user);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('X-Asset-Checksum', checksum);
    return res.send(buffer);
  } catch (err) {
    return sendError(res, { statusCode: 404, errorCode: 'DOWNLOAD_ERROR', message: err.message });
  }
});

/**
 * Update Asset Status
 * PATCH /api/v1/vault/assets/:assetId/status
 */
router.patch('/assets/:assetId/status', requireScope('vault.update'), async (req, res) => {
  try {
    const { status, notes } = req.body;
    const asset = await DocumentVault.updateAssetStatus(req.params.assetId, status, req.user, notes);
    return sendSuccess(res, { statusCode: 200, data: asset.toDict() });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'STATUS_UPDATE_ERROR', message: err.message });
  }
});

/**
 * Update Asset Metadata
 * PATCH /api/v1/vault/assets/:assetId/metadata
 */
router.patch('/assets/:assetId/metadata', requireScope('vault.update'), async (req, res) => {
  try {
    const asset = await DocumentVault.updateMetadata(req.params.assetId, req.body, req.user);
    return sendSuccess(res, { statusCode: 200, data: asset.toDict() });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'METADATA_UPDATE_ERROR', message: err.message });
  }
});

/**
 * Archive Asset
 * POST /api/v1/vault/assets/:assetId/archive
 */
router.post('/assets/:assetId/archive', requireScope('vault.archive'), async (req, res) => {
  try {
    const asset = await DocumentVault.archiveAsset(req.params.assetId, req.user);
    return sendSuccess(res, { statusCode: 200, data: asset.toDict() });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'ARCHIVE_ERROR', message: err.message });
  }
});

/**
 * Restore Asset
 * POST /api/v1/vault/assets/:assetId/restore
 */
router.post('/assets/:assetId/restore', requireScope('vault.restore'), async (req, res) => {
  try {
    const asset = await DocumentVault.restoreAsset(req.params.assetId, req.user);
    return sendSuccess(res, { statusCode: 200, data: asset.toDict() });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'RESTORE_ERROR', message: err.message });
  }
});

/**
 * Soft Delete Asset
 * DELETE /api/v1/vault/assets/:assetId
 */
router.delete('/assets/:assetId', requireScope('vault.delete'), async (req, res) => {
  try {
    const asset = await DocumentVault.deleteAsset(req.params.assetId, req.user);
    return sendSuccess(res, { statusCode: 200, data: asset.toDict() });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'DELETE_ERROR', message: err.message });
  }
});

// ─── PHASE 10.2 ENTERPRISE VERSION CONTROL & METADATA INTELLIGENCE ───────────

/**
 * List Version Snapshots for Asset
 * GET /api/v1/vault/assets/:assetId/versions
 */
router.get('/assets/:assetId/versions', requireScope('vault.read'), async (req, res) => {
  try {
    const versions = await DocumentVault.getVersionHistory(req.params.assetId);
    return sendSuccess(res, { statusCode: 200, data: versions });
  } catch (err) {
    return sendError(res, { statusCode: 404, errorCode: 'VERSION_FETCH_ERROR', message: err.message });
  }
});

/**
 * Get Specific Version Snapshot
 * GET /api/v1/vault/assets/:assetId/versions/:versionNumber
 */
router.get('/assets/:assetId/versions/:versionNumber', requireScope('vault.read'), async (req, res) => {
  try {
    const version = await DocumentVault.getVersionByNumber(req.params.assetId, req.params.versionNumber);
    if (!version) return sendError(res, { statusCode: 404, errorCode: 'VERSION_NOT_FOUND', message: 'Version snapshot not found' });
    return sendSuccess(res, { statusCode: 200, data: version });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'VERSION_FETCH_ERROR', message: err.message });
  }
});

/**
 * Get Asset Chronological Version Timeline
 * GET /api/v1/vault/assets/:assetId/timeline
 */
router.get('/assets/:assetId/timeline', requireScope('vault.read'), async (req, res) => {
  try {
    const timeline = await DocumentVault.getAssetTimeline(req.params.assetId);
    return sendSuccess(res, { statusCode: 200, data: timeline });
  } catch (err) {
    return sendError(res, { statusCode: 404, errorCode: 'TIMELINE_FETCH_ERROR', message: err.message });
  }
});

/**
 * Get Document Lineage Graph
 * GET /api/v1/vault/assets/:assetId/lineage
 */
router.get('/assets/:assetId/lineage', requireScope('vault.read'), async (req, res) => {
  try {
    const lineage = await DocumentVault.getDocumentLineage(req.params.assetId);
    return sendSuccess(res, { statusCode: 200, data: lineage });
  } catch (err) {
    return sendError(res, { statusCode: 404, errorCode: 'LINEAGE_FETCH_ERROR', message: err.message });
  }
});

/**
 * Side-by-side Version Comparison
 * GET /api/v1/vault/assets/:assetId/compare?versionA=v1.0&versionB=v1.1
 */
router.get('/assets/:assetId/compare', requireScope('vault.read'), async (req, res) => {
  try {
    const { versionA, versionB } = req.query;
    if (!versionA || !versionB) {
      return sendError(res, { statusCode: 400, errorCode: 'MISSING_PARAMS', message: 'versionA and versionB query params are required' });
    }
    const comparison = await DocumentVault.compareVersions(req.params.assetId, versionA, versionB);
    return sendSuccess(res, { statusCode: 200, data: comparison });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'COMPARISON_ERROR', message: err.message });
  }
});

/**
 * Create Manual Version Snapshot
 * POST /api/v1/vault/assets/:assetId/versions
 */
router.post('/assets/:assetId/versions', requireScope('vault.update'), async (req, res) => {
  try {
    const { incrementType, changeSummary, changeReason, versionTag, metadata } = req.body;
    const version = await DocumentVault.createVersion({
      assetId: req.params.assetId,
      incrementType: incrementType || 'MINOR',
      changeSummary: changeSummary || 'Manual version snapshot',
      changeReason,
      changedBy: req.user?.id ? `USER_${req.user.id}` : 'SYSTEM',
      versionTag: versionTag || 'PUBLISHED',
      updatedMetadata: metadata,
    });
    return sendSuccess(res, { statusCode: 201, data: version });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'VERSION_CREATE_ERROR', message: err.message });
  }
});

/**
 * Execute Soft Rollback to Target Historical Version
 * POST /api/v1/vault/assets/:assetId/rollback
 */
router.post('/assets/:assetId/rollback', requireScope('vault.archive'), async (req, res) => {
  try {
    const { targetVersionNumber, reason } = req.body;
    if (!targetVersionNumber) {
      return sendError(res, { statusCode: 400, errorCode: 'MISSING_TARGET_VERSION', message: 'targetVersionNumber is required' });
    }
    const rollbackResult = await DocumentVault.rollbackToVersion(req.params.assetId, targetVersionNumber, req.user, reason);
    return sendSuccess(res, { statusCode: 200, data: rollbackResult });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'ROLLBACK_ERROR', message: err.message });
  }
});

// ─── PHASE 10.3 SMART ORGANIZATION & ENTERPRISE SEARCH ──────────────────

router.post('/folders', requireScope('vault.update'), async (req, res) => {
  try {
    const folder = await DocumentVault.createFolder({ ...req.body, msmeId: req.msmeId || req.user?.msmeId || 1, createdBy: req.user?.id ? `USER_${req.user.id}` : 'SYSTEM' });
    return sendSuccess(res, { statusCode: 201, data: folder });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'FOLDER_CREATE_ERROR', message: err.message });
  }
});

router.get('/folders/tree', requireScope('vault.read'), async (req, res) => {
  try {
    const tree = await DocumentVault.getFolderTree(req.msmeId || req.user?.msmeId || 1);
    return sendSuccess(res, { statusCode: 200, data: tree });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'FOLDER_TREE_ERROR', message: err.message });
  }
});

router.get('/folders/:folderId', requireScope('vault.read'), async (req, res) => {
  try {
    const details = await DocumentVault.getFolderDetails(req.params.folderId, req.msmeId || req.user?.msmeId || 1);
    return sendSuccess(res, { statusCode: 200, data: details });
  } catch (err) {
    return sendError(res, { statusCode: 404, errorCode: 'FOLDER_NOT_FOUND', message: err.message });
  }
});

router.patch('/folders/:folderId', requireScope('vault.update'), async (req, res) => {
  try {
    const folder = await DocumentVault.updateFolder(req.params.folderId, req.body);
    return sendSuccess(res, { statusCode: 200, data: folder });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'FOLDER_UPDATE_ERROR', message: err.message });
  }
});

router.post('/folders/:folderId/archive', requireScope('vault.archive'), async (req, res) => {
  try {
    const folder = await DocumentVault.archiveFolder(req.params.folderId);
    return sendSuccess(res, { statusCode: 200, data: folder });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'FOLDER_ARCHIVE_ERROR', message: err.message });
  }
});

router.get('/collections', requireScope('vault.read'), async (req, res) => {
  try {
    const collections = await DocumentVault.listCollections(req.msmeId || req.user?.msmeId || 1);
    return sendSuccess(res, { statusCode: 200, data: collections });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'COLLECTION_FETCH_ERROR', message: err.message });
  }
});

router.get('/collections/:collectionId', requireScope('vault.read'), async (req, res) => {
  try {
    const evaluation = await DocumentVault.evaluateCollection(req.params.collectionId, req.msmeId || req.user?.msmeId || 1);
    return sendSuccess(res, { statusCode: 200, data: evaluation });
  } catch (err) {
    return sendError(res, { statusCode: 404, errorCode: 'COLLECTION_NOT_FOUND', message: err.message });
  }
});

router.post('/collections', requireScope('vault.update'), async (req, res) => {
  try {
    const collection = await DocumentVault.createCollection({ ...req.body, msmeId: req.msmeId || req.user?.msmeId || 1, createdBy: req.user?.id ? `USER_${req.user.id}` : 'SYSTEM' });
    return sendSuccess(res, { statusCode: 201, data: collection });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'COLLECTION_CREATE_ERROR', message: err.message });
  }
});

router.get('/tags', requireScope('vault.read'), async (req, res) => {
  try {
    const tags = await DocumentVault.getTags(req.msmeId || req.user?.msmeId || 1);
    return sendSuccess(res, { statusCode: 200, data: tags });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'TAG_FETCH_ERROR', message: err.message });
  }
});

router.post('/tags/assign', requireScope('vault.update'), async (req, res) => {
  try {
    const result = await DocumentVault.tagAssets({ ...req.body, msmeId: req.msmeId || req.user?.msmeId || 1 });
    return sendSuccess(res, { statusCode: 200, data: result });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'TAG_ASSIGN_ERROR', message: err.message });
  }
});

router.post('/tags/remove', requireScope('vault.update'), async (req, res) => {
  try {
    const result = await DocumentVault.untagAssets({ ...req.body, msmeId: req.msmeId || req.user?.msmeId || 1 });
    return sendSuccess(res, { statusCode: 200, data: result });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'TAG_REMOVE_ERROR', message: err.message });
  }
});

router.get('/taxonomy', requireScope('vault.read'), async (req, res) => {
  try {
    const taxonomy = await DocumentVault.getTaxonomy(req.msmeId || req.user?.msmeId || 1);
    return sendSuccess(res, { statusCode: 200, data: taxonomy });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'TAXONOMY_FETCH_ERROR', message: err.message });
  }
});

router.get('/activities/recent', requireScope('vault.read'), async (req, res) => {
  try {
    const activities = await DocumentVault.getRecentActivities(req.user?.id || 'ANONYMOUS', req.msmeId || req.user?.msmeId || 1);
    return sendSuccess(res, { statusCode: 200, data: activities });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'ACTIVITIES_FETCH_ERROR', message: err.message });
  }
});

router.post('/favorites/toggle', requireScope('vault.read'), async (req, res) => {
  try {
    const result = await DocumentVault.toggleFavorite({ ...req.body, userId: req.user?.id || 'ANONYMOUS', msmeId: req.msmeId || req.user?.msmeId || 1 });
    return sendSuccess(res, { statusCode: 200, data: result });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'FAVORITE_TOGGLE_ERROR', message: err.message });
  }
});

router.get('/favorites', requireScope('vault.read'), async (req, res) => {
  try {
    const favorites = await DocumentVault.getFavorites(req.user?.id || 'ANONYMOUS', req.msmeId || req.user?.msmeId || 1);
    return sendSuccess(res, { statusCode: 200, data: favorites });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'FAVORITE_FETCH_ERROR', message: err.message });
  }
});

router.get('/searches/saved', requireScope('vault.read'), async (req, res) => {
  try {
    const searches = await DocumentVault.listSavedSearches(req.user?.id || 'ANONYMOUS', req.msmeId || req.user?.msmeId || 1);
    return sendSuccess(res, { statusCode: 200, data: searches });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'SAVED_SEARCH_FETCH_ERROR', message: err.message });
  }
});

router.post('/searches/saved', requireScope('vault.read'), async (req, res) => {
  try {
    const saved = await DocumentVault.saveSearch({ ...req.body, userId: req.user?.id || 'ANONYMOUS', msmeId: req.msmeId || req.user?.msmeId || 1 });
    return sendSuccess(res, { statusCode: 201, data: saved });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'SAVED_SEARCH_CREATE_ERROR', message: err.message });
  }
});

router.delete('/searches/saved/:searchId', requireScope('vault.read'), async (req, res) => {
  try {
    const result = await DocumentVault.deleteSavedSearch(req.params.searchId, req.user?.id || 'ANONYMOUS');
    return sendSuccess(res, { statusCode: 200, data: result });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'SAVED_SEARCH_DELETE_ERROR', message: err.message });
  }
});

router.post('/bulk/move', requireScope('vault.update'), async (req, res) => {
  try {
    const result = await DocumentVault.bulkMove({ ...req.body, msmeId: req.msmeId || req.user?.msmeId || 1, user: req.user });
    return sendSuccess(res, { statusCode: 200, data: result });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'BULK_MOVE_ERROR', message: err.message });
  }
});

router.post('/bulk/categorize', requireScope('vault.update'), async (req, res) => {
  try {
    const result = await DocumentVault.bulkCategorize({ ...req.body, msmeId: req.msmeId || req.user?.msmeId || 1, user: req.user });
    return sendSuccess(res, { statusCode: 200, data: result });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'BULK_CATEGORIZE_ERROR', message: err.message });
  }
});

router.post('/bulk/lifecycle', requireScope('vault.archive'), async (req, res) => {
  try {
    const result = await DocumentVault.bulkLifecycleAction({ ...req.body, msmeId: req.msmeId || req.user?.msmeId || 1, user: req.user });
    return sendSuccess(res, { statusCode: 200, data: result });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'BULK_LIFECYCLE_ERROR', message: err.message });
  }
});

router.post('/bulk/export', requireScope('vault.read'), async (req, res) => {
  try {
    const exportData = await DocumentVault.bulkExportMetadata({ ...req.body, msmeId: req.msmeId || req.user?.msmeId || 1 });
    return sendSuccess(res, { statusCode: 200, data: exportData });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'BULK_EXPORT_ERROR', message: err.message });
  }
});

router.get('/search/advanced', requireScope('vault.read'), async (req, res) => {
  try {
    const searchRes = await DocumentVault.advancedSearch({ ...req.query, msmeId: req.msmeId || req.user?.msmeId || 1 });
    return sendSuccess(res, { statusCode: 200, data: searchRes });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'SEARCH_ERROR', message: err.message });
  }
});

// ─── PHASE 10.4 ENTERPRISE SHARING, PERMISSIONS & COLLABORATION ───────────

router.post('/assets/:assetId/evaluate-access', requireScope('vault.read'), async (req, res) => {
  try {
    const access = await DocumentVault.evaluateAccess({
      user: req.user,
      assetId: req.params.assetId,
      requestedAction: req.body.requestedAction || 'view',
      msmeId: req.msmeId || req.user?.msmeId || 1,
    });
    return sendSuccess(res, { statusCode: 200, data: access });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'EVALUATE_ACCESS_ERROR', message: err.message });
  }
});

router.post('/assets/:assetId/shares', requireScope('vault.update'), async (req, res) => {
  try {
    const share = await DocumentVault.shareAsset({
      ...req.body,
      assetId: req.params.assetId,
      sharedBy: req.user?.id ? `USER_${req.user.id}` : 'SYSTEM',
      msmeId: req.msmeId || req.user?.msmeId || 1,
    });
    return sendSuccess(res, { statusCode: 201, data: share });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'SHARE_CREATE_ERROR', message: err.message });
  }
});

router.delete('/shares/:shareId', requireScope('vault.update'), async (req, res) => {
  try {
    const revoked = await DocumentVault.revokeShare(req.params.shareId, req.msmeId || req.user?.msmeId || 1);
    return sendSuccess(res, { statusCode: 200, data: revoked });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'SHARE_REVOKE_ERROR', message: err.message });
  }
});

router.get('/assets/:assetId/shares', requireScope('vault.read'), async (req, res) => {
  try {
    const shares = await DocumentVault.listAssetShares(req.params.assetId, req.msmeId || req.user?.msmeId || 1);
    return sendSuccess(res, { statusCode: 200, data: shares });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'SHARE_LIST_ERROR', message: err.message });
  }
});

router.get('/shares/incoming', requireScope('vault.read'), async (req, res) => {
  try {
    const shares = await DocumentVault.listIncomingShares(req.user?.id || 'ANONYMOUS', req.msmeId || req.user?.msmeId || 1);
    return sendSuccess(res, { statusCode: 200, data: shares });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'INCOMING_SHARES_ERROR', message: err.message });
  }
});

router.post('/assets/:assetId/comments', requireScope('vault.read'), async (req, res) => {
  try {
    const comment = await DocumentVault.addComment({
      ...req.body,
      assetId: req.params.assetId,
      userId: req.user?.id || 'ANONYMOUS',
      userName: req.user?.name || req.user?.email || 'Enterprise User',
      msmeId: req.msmeId || req.user?.msmeId || 1,
    });
    return sendSuccess(res, { statusCode: 201, data: comment });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'COMMENT_CREATE_ERROR', message: err.message });
  }
});

router.get('/assets/:assetId/comments', requireScope('vault.read'), async (req, res) => {
  try {
    const comments = await DocumentVault.getComments(req.params.assetId, req.msmeId || req.user?.msmeId || 1);
    return sendSuccess(res, { statusCode: 200, data: comments });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'COMMENT_LIST_ERROR', message: err.message });
  }
});

router.post('/comments/:commentId/resolve', requireScope('vault.read'), async (req, res) => {
  try {
    const resolved = await DocumentVault.resolveComment({
      ...req.body,
      commentId: req.params.commentId,
      userId: req.user?.id || 'ANONYMOUS',
      msmeId: req.msmeId || req.user?.msmeId || 1,
    });
    return sendSuccess(res, { statusCode: 200, data: resolved });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'COMMENT_RESOLVE_ERROR', message: err.message });
  }
});

router.post('/assets/:assetId/watch', requireScope('vault.read'), async (req, res) => {
  try {
    const watch = await DocumentVault.toggleWatch({
      assetId: req.params.assetId,
      userId: req.user?.id || 'ANONYMOUS',
      msmeId: req.msmeId || req.user?.msmeId || 1,
    });
    return sendSuccess(res, { statusCode: 200, data: watch });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'WATCH_TOGGLE_ERROR', message: err.message });
  }
});

router.get('/assets/:assetId/watchers', requireScope('vault.read'), async (req, res) => {
  try {
    const watchers = await DocumentVault.getWatchers(req.params.assetId, req.msmeId || req.user?.msmeId || 1);
    return sendSuccess(res, { statusCode: 200, data: watchers });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'WATCHER_LIST_ERROR', message: err.message });
  }
});

router.post('/assets/:assetId/review-requests', requireScope('vault.read'), async (req, res) => {
  try {
    const reviewReq = await DocumentVault.createReviewRequest({
      ...req.body,
      assetId: req.params.assetId,
      requesterId: req.user?.id || 'ANONYMOUS',
      msmeId: req.msmeId || req.user?.msmeId || 1,
    });
    return sendSuccess(res, { statusCode: 201, data: reviewReq });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'REVIEW_REQUEST_CREATE_ERROR', message: err.message });
  }
});

router.patch('/review-requests/:requestId/status', requireScope('vault.read'), async (req, res) => {
  try {
    const updated = await DocumentVault.updateReviewStatus({
      ...req.body,
      requestId: req.params.requestId,
      reviewerId: req.user?.id || 'ANONYMOUS',
      msmeId: req.msmeId || req.user?.msmeId || 1,
    });
    return sendSuccess(res, { statusCode: 200, data: updated });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'REVIEW_STATUS_UPDATE_ERROR', message: err.message });
  }
});

router.get('/assets/:assetId/review-requests', requireScope('vault.read'), async (req, res) => {
  try {
    const requests = await DocumentVault.getAssetReviewRequests(req.params.assetId, req.msmeId || req.user?.msmeId || 1);
    return sendSuccess(res, { statusCode: 200, data: requests });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'REVIEW_REQUEST_LIST_ERROR', message: err.message });
  }
});

router.get('/activities/feed', requireScope('vault.read'), async (req, res) => {
  try {
    const feed = await DocumentVault.getActivityFeed({ ...req.query, msmeId: req.msmeId || req.user?.msmeId || 1 });
    return sendSuccess(res, { statusCode: 200, data: feed });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'ACTIVITY_FEED_ERROR', message: err.message });
  }
});

// ─── PHASE 10.5 ENTERPRISE RECORDS MANAGEMENT, RETENTION & LEGAL HOLD ────

router.post('/assets/:assetId/lifecycle', requireScope('vault.update'), async (req, res) => {
  try {
    const updated = await DocumentVault.transitionLifecycle({
      assetId: req.params.assetId,
      targetState: req.body.targetState,
      actorId: req.user?.id ? `USER_${req.user.id}` : 'SYSTEM',
      msmeId: req.msmeId || req.user?.msmeId || 1,
    });
    return sendSuccess(res, { statusCode: 200, data: updated });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'LIFECYCLE_TRANSITION_ERROR', message: err.message });
  }
});

router.get('/policies', requireScope('vault.read'), async (req, res) => {
  try {
    const policies = await DocumentVault.listPolicies(req.msmeId || req.user?.msmeId || 1);
    return sendSuccess(res, { statusCode: 200, data: policies });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'POLICY_LIST_ERROR', message: err.message });
  }
});

router.post('/policies', requireScope('vault.update'), async (req, res) => {
  try {
    const policy = await DocumentVault.createPolicy({ ...req.body, createdBy: req.user?.id ? `USER_${req.user.id}` : 'SYSTEM', msmeId: req.msmeId || req.user?.msmeId || 1 });
    return sendSuccess(res, { statusCode: 201, data: policy });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'POLICY_CREATE_ERROR', message: err.message });
  }
});

router.post('/assets/:assetId/policies', requireScope('vault.update'), async (req, res) => {
  try {
    const assignment = await DocumentVault.assignPolicy({
      assetId: req.params.assetId,
      policyId: req.body.policyId,
      assignedBy: req.user?.id ? `USER_${req.user.id}` : 'SYSTEM',
      msmeId: req.msmeId || req.user?.msmeId || 1,
    });
    return sendSuccess(res, { statusCode: 200, data: assignment });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'POLICY_ASSIGN_ERROR', message: err.message });
  }
});

router.get('/legal-holds', requireScope('vault.read'), async (req, res) => {
  try {
    const holds = await DocumentVault.listLegalHolds(req.msmeId || req.user?.msmeId || 1);
    return sendSuccess(res, { statusCode: 200, data: holds });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'LEGAL_HOLD_LIST_ERROR', message: err.message });
  }
});

router.post('/legal-holds', requireScope('vault.update'), async (req, res) => {
  try {
    const hold = await DocumentVault.createLegalHold({
      ...req.body,
      assignedBy: req.user?.id ? `USER_${req.user.id}` : 'SYSTEM',
      msmeId: req.msmeId || req.user?.msmeId || 1,
    });
    return sendSuccess(res, { statusCode: 201, data: hold });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'LEGAL_HOLD_CREATE_ERROR', message: err.message });
  }
});

router.post('/legal-holds/:holdId/release', requireScope('vault.archive'), async (req, res) => {
  try {
    const released = await DocumentVault.releaseLegalHold({
      holdId: req.params.holdId,
      releasedBy: req.user?.id ? `USER_${req.user.id}` : 'SYSTEM',
      notes: req.body.notes,
      msmeId: req.msmeId || req.user?.msmeId || 1,
    });
    return sendSuccess(res, { statusCode: 200, data: released });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'LEGAL_HOLD_RELEASE_ERROR', message: err.message });
  }
});

router.get('/archives', requireScope('vault.read'), async (req, res) => {
  try {
    const archives = await DocumentVault.listArchivedAssets(req.msmeId || req.user?.msmeId || 1);
    return sendSuccess(res, { statusCode: 200, data: archives });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'ARCHIVE_LIST_ERROR', message: err.message });
  }
});

router.post('/assets/:assetId/archive', requireScope('vault.archive'), async (req, res) => {
  try {
    const archiveRecord = await DocumentVault.archiveAsset({
      ...req.body,
      assetId: req.params.assetId,
      archivedBy: req.user?.id ? `USER_${req.user.id}` : 'SYSTEM',
      msmeId: req.msmeId || req.user?.msmeId || 1,
    });
    return sendSuccess(res, { statusCode: 200, data: archiveRecord });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'ARCHIVE_ERROR', message: err.message });
  }
});

router.post('/assets/:assetId/restore', requireScope('vault.archive'), async (req, res) => {
  try {
    const restored = await DocumentVault.restoreAsset({
      assetId: req.params.assetId,
      restoredBy: req.user?.id ? `USER_${req.user.id}` : 'SYSTEM',
      msmeId: req.msmeId || req.user?.msmeId || 1,
    });
    return sendSuccess(res, { statusCode: 200, data: restored });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'RESTORE_ERROR', message: err.message });
  }
});

router.get('/dispositions', requireScope('vault.read'), async (req, res) => {
  try {
    const queue = await DocumentVault.listDispositionQueue(req.msmeId || req.user?.msmeId || 1);
    return sendSuccess(res, { statusCode: 200, data: queue });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'DISPOSITION_LIST_ERROR', message: err.message });
  }
});

router.post('/assets/:assetId/disposition', requireScope('vault.archive'), async (req, res) => {
  try {
    const record = await DocumentVault.queueForDisposition({
      ...req.body,
      assetId: req.params.assetId,
      msmeId: req.msmeId || req.user?.msmeId || 1,
    });
    return sendSuccess(res, { statusCode: 201, data: record });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'DISPOSITION_QUEUE_ERROR', message: err.message });
  }
});

router.post('/dispositions/:dispositionId/review', requireScope('vault.archive'), async (req, res) => {
  try {
    const reviewed = await DocumentVault.reviewDisposition({
      ...req.body,
      dispositionId: req.params.dispositionId,
      reviewerId: req.user?.id || 'ANONYMOUS',
      msmeId: req.msmeId || req.user?.msmeId || 1,
    });
    return sendSuccess(res, { statusCode: 200, data: reviewed });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'DISPOSITION_REVIEW_ERROR', message: err.message });
  }
});

router.post('/dispositions/:dispositionId/execute', requireScope('vault.delete'), async (req, res) => {
  try {
    const executed = await DocumentVault.executeDisposition({
      dispositionId: req.params.dispositionId,
      executorId: req.user?.id || 'ANONYMOUS',
      msmeId: req.msmeId || req.user?.msmeId || 1,
    });
    return sendSuccess(res, { statusCode: 200, data: executed });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'DISPOSITION_EXECUTE_ERROR', message: err.message });
  }
});

router.get('/governance/metrics', requireScope('vault.read'), async (req, res) => {
  try {
    const metrics = await DocumentVault.getGovernanceMetrics(req.msmeId || req.user?.msmeId || 1);
    return sendSuccess(res, { statusCode: 200, data: metrics });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'GOVERNANCE_METRICS_ERROR', message: err.message });
  }
});

router.post('/governance/reports', requireScope('vault.read'), async (req, res) => {
  try {
    const report = await DocumentVault.generateReport({ ...req.body, msmeId: req.msmeId || req.user?.msmeId || 1 });
    return sendSuccess(res, { statusCode: 201, data: report });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'GOVERNANCE_REPORT_ERROR', message: err.message });
  }
});

module.exports = router;
