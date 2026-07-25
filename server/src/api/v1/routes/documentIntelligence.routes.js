/**
 * documentIntelligence.routes.js
 * REST API Routes for Phase 9.3 AI Document Intelligence (/api/v1/document-intelligence).
 */

const express = require('express');
const { DocumentIntelligence } = require('../../../documentIntelligence');
const { requireScope } = require('../../../middleware/scopeAuth.middleware');
const { sendSuccess, sendError } = require('../../../utils/apiResponse');

const router = express.Router();

/**
 * Upload & Analyze Document
 * POST /api/v1/document-intelligence/analyze
 */
router.post('/analyze', requireScope('ai.use'), async (req, res) => {
  try {
    const { fileName, ocrProviderCode } = req.body;
    const msmeId = req.msmeId || req.user?.msmeId || req.body.msmeId || 1;

    const result = await DocumentIntelligence.analyzeDocument({
      msmeId,
      fileName: fileName || 'GST_Certificate.pdf',
      ocrProviderCode: ocrProviderCode || 'MOCK_OCR',
    });

    return sendSuccess(res, { statusCode: 200, data: result });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'DOCUMENT_ANALYSIS_ERROR', message: 'Failed to analyze document.', details: err.message });
  }
});

/**
 * List Analyzed Documents
 * GET /api/v1/document-intelligence/documents
 */
router.get('/documents', requireScope('ai.use'), async (req, res) => {
  try {
    const msmeId = req.msmeId || req.user?.msmeId || req.query.msmeId || 1;
    const documents = await DocumentIntelligence.getDocumentAnalyses(msmeId);
    return sendSuccess(res, { statusCode: 200, data: documents });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'DOCUMENT_FETCH_ERROR', message: 'Failed to fetch documents.', details: err.message });
  }
});

/**
 * Get Document Details by Analysis ID
 * GET /api/v1/document-intelligence/documents/:id
 */
router.get('/documents/:id', requireScope('ai.use'), async (req, res) => {
  try {
    const document = await DocumentIntelligence.getDocumentById(req.params.id);
    if (!document) {
      return sendError(res, { statusCode: 404, errorCode: 'DOCUMENT_NOT_FOUND', message: 'Document analysis not found.' });
    }
    return sendSuccess(res, { statusCode: 200, data: document });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'DOCUMENT_FETCH_ERROR', message: 'Failed to fetch document details.', details: err.message });
  }
});

/**
 * Approve Document Review & Submit Field Overrides
 * POST /api/v1/document-intelligence/documents/:id/approve
 */
router.post('/documents/:id/approve', requireScope('ai.admin'), async (req, res) => {
  try {
    const { overriddenFields, notes } = req.body;
    const reviewerId = req.user?.id ? `USER_${req.user.id}` : 'SYSTEM';

    const result = await DocumentIntelligence.processApproval({
      analysisId: req.params.id,
      reviewerId,
      decision: 'APPROVED',
      overriddenFields: overriddenFields || {},
      notes: notes || 'Approved during human review workflow',
    });

    return sendSuccess(res, { statusCode: 200, data: result });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'APPROVAL_ERROR', message: 'Failed to approve document analysis.', details: err.message });
  }
});

/**
 * Reject Document Review
 * POST /api/v1/document-intelligence/documents/:id/reject
 */
router.post('/documents/:id/reject', requireScope('ai.admin'), async (req, res) => {
  try {
    const { notes } = req.body;
    const reviewerId = req.user?.id ? `USER_${req.user.id}` : 'SYSTEM';

    const result = await DocumentIntelligence.processApproval({
      analysisId: req.params.id,
      reviewerId,
      decision: 'REJECTED',
      notes: notes || 'Rejected during human review workflow',
    });

    return sendSuccess(res, { statusCode: 200, data: result });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'APPROVAL_ERROR', message: 'Failed to reject document analysis.', details: err.message });
  }
});

/**
 * Compare Two Documents
 * POST /api/v1/document-intelligence/compare
 */
router.post('/compare', requireScope('ai.use'), async (req, res) => {
  try {
    const { sourceFields, targetFields } = req.body;
    const comparison = DocumentIntelligence.compareDocuments(sourceFields || [], targetFields || []);
    return sendSuccess(res, { statusCode: 200, data: comparison });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'COMPARISON_ERROR', message: 'Failed to compare documents.', details: err.message });
  }
});

module.exports = router;
