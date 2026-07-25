/**
 * aiGovernance.routes.js
 * REST API Routes for Phase 9.6 Enterprise AI Governance & Production Hardening (/api/v1/ai-governance).
 */

const express = require('express');
const { AIGovernance } = require('../../../aiPlatform');
const { requireScope } = require('../../../middleware/scopeAuth.middleware');
const { sendSuccess, sendError } = require('../../../utils/apiResponse');

const router = express.Router();

/**
 * Get Provider Health Grid
 * GET /api/v1/ai-governance/health-grid
 */
router.get('/health-grid', requireScope('ai.analytics'), async (req, res) => {
  try {
    const grid = AIGovernance.getHealthGrid();
    return sendSuccess(res, { statusCode: 200, data: grid });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'HEALTH_GRID_ERROR', message: 'Failed to fetch health grid.', details: err.message });
  }
});

/**
 * Get Cost & Quota Analytics
 * GET /api/v1/ai-governance/cost-analytics
 */
router.get('/cost-analytics', requireScope('ai.analytics'), async (req, res) => {
  try {
    const msmeId = req.msmeId || req.user?.msmeId || req.query.msmeId || 1;
    const quota = await AIGovernance.getCostQuota(msmeId);
    return sendSuccess(res, { statusCode: 200, data: quota });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'COST_ANALYTICS_ERROR', message: 'Failed to fetch cost analytics.', details: err.message });
  }
});

/**
 * Get Evaluation Run Benchmark Metrics
 * GET /api/v1/ai-governance/evaluations
 */
router.get('/evaluations', requireScope('ai.analytics'), async (req, res) => {
  try {
    const evals = await AIGovernance.getEvaluations();
    return sendSuccess(res, { statusCode: 200, data: evals });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'EVALUATIONS_FETCH_ERROR', message: 'Failed to fetch evaluation metrics.', details: err.message });
  }
});

/**
 * Get Pending Human Approval Tasks
 * GET /api/v1/ai-governance/approvals
 */
router.get('/approvals', requireScope('ai.admin'), async (req, res) => {
  try {
    const msmeId = req.msmeId || req.user?.msmeId || req.query.msmeId || 1;
    const tasks = await AIGovernance.getPendingApprovals(msmeId);
    return sendSuccess(res, { statusCode: 200, data: tasks });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'APPROVALS_FETCH_ERROR', message: 'Failed to fetch human approval tasks.', details: err.message });
  }
});

/**
 * Decide Human Approval Task
 * POST /api/v1/ai-governance/approvals/:id/decide
 */
router.post('/approvals/:id/decide', requireScope('ai.admin'), async (req, res) => {
  try {
    const taskId = req.params.id;
    const { decision, notes } = req.body;
    const reviewerId = req.user?.id ? `USER_${req.user.id}` : 'ADMIN_1';

    const result = await AIGovernance.decideApproval({ taskId, decision: decision || 'APPROVED', reviewerId, notes });
    return sendSuccess(res, { statusCode: 200, data: result });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'APPROVAL_DECIDE_ERROR', message: 'Failed to update approval decision.', details: err.message });
  }
});

module.exports = router;
