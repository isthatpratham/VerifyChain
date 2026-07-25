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

module.exports = router;
