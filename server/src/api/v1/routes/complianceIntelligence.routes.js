/**
 * complianceIntelligence.routes.js
 * REST API Routes for Phase 9.2 AI Compliance Intelligence Engine (/api/v1/ai-compliance).
 */

const express = require('express');
const { ComplianceIntelligence } = require('../../../complianceIntelligence');
const { requireScope } = require('../../../middleware/scopeAuth.middleware');
const { sendSuccess, sendError } = require('../../../utils/apiResponse');

const router = express.Router();

/**
 * Trigger Full Compliance Intelligence Analysis
 * POST /api/v1/ai-compliance/analyze
 */
router.post('/analyze', requireScope('ai.compliance.manage'), async (req, res) => {
  try {
    const msmeId = req.msmeId || req.user?.msmeId || req.body.msmeId || 1;
    const userId = req.user?.id ? `USER_${req.user.id}` : 'SYSTEM';

    const result = await ComplianceIntelligence.runFullAnalysis({ msmeId, userId });
    return sendSuccess(res, { statusCode: 200, data: result });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'ANALYSIS_ERROR', message: 'Failed to execute compliance intelligence analysis.', details: err.message });
  }
});

/**
 * Get Recommendations
 * GET /api/v1/ai-compliance/recommendations
 */
router.get('/recommendations', requireScope('ai.recommendations.read'), async (req, res) => {
  try {
    const msmeId = req.msmeId || req.user?.msmeId || req.query.msmeId || 1;
    const recs = await ComplianceIntelligence.getRecommendations(msmeId);
    return sendSuccess(res, { statusCode: 200, data: recs });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'RECOMMENDATION_FETCH_ERROR', message: 'Failed to fetch recommendations.', details: err.message });
  }
});

/**
 * Accept / Dismiss Recommendation
 * POST /api/v1/ai-compliance/recommendations/:id/accept
 * POST /api/v1/ai-compliance/recommendations/:id/dismiss
 */
router.post('/recommendations/:id/accept', requireScope('ai.compliance.manage'), async (req, res) => {
  try {
    const msmeId = req.msmeId || req.user?.msmeId || req.body.msmeId || 1;
    const userId = req.user?.id ? `USER_${req.user.id}` : 'SYSTEM';
    const result = await ComplianceIntelligence.updateRecommendationStatus(msmeId, req.params.id, 'ACCEPTED', userId);
    return sendSuccess(res, { statusCode: 200, data: result });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'RECOMMENDATION_UPDATE_ERROR', message: 'Failed to update recommendation status.', details: err.message });
  }
});

router.post('/recommendations/:id/dismiss', requireScope('ai.compliance.manage'), async (req, res) => {
  try {
    const msmeId = req.msmeId || req.user?.msmeId || req.body.msmeId || 1;
    const userId = req.user?.id ? `USER_${req.user.id}` : 'SYSTEM';
    const result = await ComplianceIntelligence.updateRecommendationStatus(msmeId, req.params.id, 'DISMISSED', userId);
    return sendSuccess(res, { statusCode: 200, data: result });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'RECOMMENDATION_UPDATE_ERROR', message: 'Failed to update recommendation status.', details: err.message });
  }
});

/**
 * Get Risk Overview
 * GET /api/v1/ai-compliance/risks
 */
router.get('/risks', requireScope('ai.compliance.read'), async (req, res) => {
  try {
    const msmeId = req.msmeId || req.user?.msmeId || req.query.msmeId || 1;
    const risks = await ComplianceIntelligence.getRiskAssessment(msmeId);
    return sendSuccess(res, { statusCode: 200, data: risks });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'RISK_FETCH_ERROR', message: 'Failed to fetch risk assessment.', details: err.message });
  }
});

/**
 * Get Executive Summary
 * GET /api/v1/ai-compliance/executive-summary
 */
router.get('/executive-summary', requireScope('ai.executive.read'), async (req, res) => {
  try {
    const msmeId = req.msmeId || req.user?.msmeId || req.query.msmeId || 1;
    const summary = await ComplianceIntelligence.getExecutiveSummary(msmeId);
    return sendSuccess(res, { statusCode: 200, data: summary });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'EXECUTIVE_SUMMARY_FETCH_ERROR', message: 'Failed to fetch executive summary.', details: err.message });
  }
});

/**
 * Get Compliance Gaps
 * GET /api/v1/ai-compliance/gaps
 */
router.get('/gaps', requireScope('ai.compliance.read'), async (req, res) => {
  try {
    const msmeId = req.msmeId || req.user?.msmeId || req.query.msmeId || 1;
    const gaps = await ComplianceIntelligence.getComplianceGaps(msmeId);
    return sendSuccess(res, { statusCode: 200, data: gaps });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'GAPS_FETCH_ERROR', message: 'Failed to fetch compliance gaps.', details: err.message });
  }
});

/**
 * Get Action Plans
 * GET /api/v1/ai-compliance/action-plans
 */
router.get('/action-plans', requireScope('ai.compliance.read'), async (req, res) => {
  try {
    const msmeId = req.msmeId || req.user?.msmeId || req.query.msmeId || 1;
    const plans = await ComplianceIntelligence.getActionPlans(msmeId);
    return sendSuccess(res, { statusCode: 200, data: plans });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'ACTION_PLANS_FETCH_ERROR', message: 'Failed to fetch action plans.', details: err.message });
  }
});

module.exports = router;
