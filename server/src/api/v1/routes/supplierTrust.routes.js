/**
 * supplierTrust.routes.js
 * Supplier Trust Profile REST API (/api/v1/trust).
 * Exposes trust level, verification status, timeline events, and trust score metadata.
 */
const express = require('express');
const router = express.Router();
const supplierTrustService = require('../../../services/supplierTrust.service');
const defaultPrisma = require('../../../utils/prismaClient');
const { sendSuccess, sendError } = require('../../../utils/apiResponse');
const { parseQueryParams, createPaginationMeta } = require('../../../utils/apiQueryParams');
const apiKeyAuthMiddleware = require('../../../middleware/apiKeyAuth.middleware');
const { requireScope } = require('../../../middleware/scopeAuth.middleware');

router.use(apiKeyAuthMiddleware());

/**
 * GET /api/v1/trust/profiles
 * List supplier trust profiles
 * Scope: trust.read
 */
router.get('/profiles', requireScope('trust.read'), async (req, res) => {
  try {
    const queryParams = parseQueryParams(req.query, ['id', 'display_name', 'trust_level', 'created_at']);
    const { trust_level, verification_state, is_public } = req.query;

    const where = {};
    if (trust_level) where.trust_level = trust_level;
    if (verification_state) where.verification_state = verification_state;
    if (is_public !== undefined) where.is_public = is_public === 'true';

    const [profiles, total] = await Promise.all([
      defaultPrisma.supplierTrustProfile.findMany({
        where,
        orderBy: queryParams.orderBy,
        skip: queryParams.skip,
        take: queryParams.limit,
      }),
      defaultPrisma.supplierTrustProfile.count({ where }),
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
      errorCode: 'TRUST_PROFILE_FETCH_ERROR',
      message: 'Failed to fetch supplier trust profiles.',
      details: err.message,
    });
  }
});

/**
 * GET /api/v1/trust/profiles/:id
 * Retrieve detailed supplier trust profile by ID
 * Scope: trust.read
 */
router.get('/profiles/:id', requireScope('trust.read'), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return sendError(res, { statusCode: 400, errorCode: 'INVALID_ID', message: 'Profile ID must be an integer.' });
    }

    const profile = await supplierTrustService.getProfileById(id);
    if (!profile) {
      return sendError(res, { statusCode: 404, errorCode: 'PROFILE_NOT_FOUND', message: `Supplier trust profile ID ${id} not found.` });
    }

    return sendSuccess(res, { statusCode: 200, data: profile });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'TRUST_PROFILE_FETCH_ERROR', message: 'Failed to fetch trust profile.', details: err.message });
  }
});

module.exports = router;
