/**
 * compliance.routes.js
 * Statutory Compliance REST API (/api/v1/compliance).
 * Exposes compliance records, requirements, status, and Health Intelligence breakdowns.
 */
const express = require('express');
const router = express.Router();
const healthIntelligenceService = require('../../../services/healthIntelligence.service');
const { complianceRecordRepository } = require('../../../repositories');
const { sendSuccess, sendError } = require('../../../utils/apiResponse');
const { parseQueryParams, createPaginationMeta } = require('../../../utils/apiQueryParams');
const apiKeyAuthMiddleware = require('../../../middleware/apiKeyAuth.middleware');
const { requireScope } = require('../../../middleware/scopeAuth.middleware');

router.use(apiKeyAuthMiddleware());

/**
 * GET /api/v1/compliance
 * List statutory compliance records
 * Scope: compliance.read
 */
router.get('/', requireScope('compliance.read'), async (req, res) => {
  try {
    const queryParams = parseQueryParams(req.query, ['id', 'last_checked', 'expiry_date', 'created_at']);
    const { msme_id, authority, status, priority } = req.query;

    const where = {};
    if (msme_id) where.msme_id = parseInt(msme_id, 10);
    if (authority) where.authority = authority;
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const [records, total] = await Promise.all([
      complianceRecordRepository.findMany({
        where,
        orderBy: queryParams.orderBy,
        skip: queryParams.skip,
        take: queryParams.limit,
      }),
      complianceRecordRepository.count(where),
    ]);

    const pagination = createPaginationMeta(total, queryParams.page, queryParams.limit);

    return sendSuccess(res, {
      statusCode: 200,
      data: records,
      pagination,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: 500,
      errorCode: 'COMPLIANCE_FETCH_ERROR',
      message: 'Failed to fetch compliance records.',
      details: err.message,
    });
  }
});

/**
 * GET /api/v1/compliance/health
 * Retrieve Health Intelligence scores & category breakdown
 * Scope: health.read
 */
router.get('/health', requireScope('health.read'), async (req, res) => {
  try {
    const msmeId = req.query.msme_id ? parseInt(req.query.msme_id, 10) : req.msmeId || 8;
    const intelligence = await healthIntelligenceService.getCurrentScore(msmeId);

    return sendSuccess(res, {
      statusCode: 200,
      data: intelligence,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: 500,
      errorCode: 'HEALTH_INTEL_ERROR',
      message: 'Failed to fetch health intelligence breakdown.',
      details: err.message,
    });
  }
});

module.exports = router;
