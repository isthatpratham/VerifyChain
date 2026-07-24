/**
 * business.routes.js
 * Business Profile REST API (/api/v1/businesses).
 * Secure, versioned CRUD operations for MSME Business Profiles.
 */
const express = require('express');
const router = express.Router();
const msmeService = require('../../../services/msme.service');
const { msmeProfileRepository } = require('../../../repositories');
const { sendSuccess, sendError } = require('../../../utils/apiResponse');
const { parseQueryParams, createPaginationMeta } = require('../../../utils/apiQueryParams');
const apiKeyAuthMiddleware = require('../../../middleware/apiKeyAuth.middleware');
const { requireScope } = require('../../../middleware/scopeAuth.middleware');

router.use(apiKeyAuthMiddleware());

/**
 * GET /api/v1/businesses
 * List & search enterprise business profiles
 * Scope: business.read
 */
router.get('/', requireScope('business.read'), async (req, res) => {
  try {
    const queryParams = parseQueryParams(req.query, ['id', 'business_name', 'gstin', 'created_at']);
    const { state, sector, business_type } = req.query;

    const where = {};
    if (state) where.state = state;
    if (sector) where.sector = sector;
    if (business_type) where.business_type = business_type;

    if (queryParams.search) {
      where.OR = [
        { business_name: { contains: queryParams.search, mode: 'insensitive' } },
        { gstin: { contains: queryParams.search, mode: 'insensitive' } },
        { udyam_number: { contains: queryParams.search, mode: 'insensitive' } },
      ];
    }

    const [profiles, total] = await Promise.all([
      msmeProfileRepository.findMany({
        where,
        orderBy: queryParams.orderBy,
        skip: queryParams.skip,
        take: queryParams.limit,
      }),
      msmeProfileRepository.count(where),
    ]);

    const pagination = createPaginationMeta(total, queryParams.page, queryParams.limit);

    return sendSuccess(res, {
      statusCode: 200,
      data: profiles,
      pagination,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: 500,
      errorCode: 'BUSINESS_FETCH_ERROR',
      message: 'Failed to fetch business profiles.',
      details: err.message,
    });
  }
});

/**
 * GET /api/v1/businesses/:id
 * Retrieve business profile by ID
 * Scope: business.read
 */
router.get('/:id', requireScope('business.read'), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return sendError(res, { statusCode: 400, errorCode: 'INVALID_ID', message: 'Business ID must be an integer.' });
    }

    const profile = await msmeProfileRepository.findById(id);
    if (!profile) {
      return sendError(res, { statusCode: 404, errorCode: 'BUSINESS_NOT_FOUND', message: `Business profile ID ${id} not found.` });
    }

    return sendSuccess(res, { statusCode: 200, data: profile });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'BUSINESS_FETCH_ERROR', message: 'Failed to fetch business profile.', details: err.message });
  }
});

/**
 * PATCH /api/v1/businesses/:id
 * Update business profile
 * Scope: business.write
 */
router.patch('/:id', requireScope('business.write'), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return sendError(res, { statusCode: 400, errorCode: 'INVALID_ID', message: 'Business ID must be an integer.' });
    }

    const updated = await msmeProfileRepository.update({ id }, req.body);
    return sendSuccess(res, { statusCode: 200, data: updated });
  } catch (err) {
    return sendError(res, { statusCode: 400, errorCode: 'UPDATE_FAILED', message: err.message });
  }
});

module.exports = router;
