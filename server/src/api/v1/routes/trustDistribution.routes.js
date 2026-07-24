/**
 * trustDistribution.routes.js
 * Trust Distribution REST API (/api/v1/distribution).
 * Exposes distribution identities, channel metadata, and asset capabilities.
 */
const express = require('express');
const router = express.Router();
const trustDistributionService = require('../../../services/trustDistribution.service');
const defaultPrisma = require('../../../utils/prismaClient');
const { sendSuccess, sendError } = require('../../../utils/apiResponse');
const { parseQueryParams, createPaginationMeta } = require('../../../utils/apiQueryParams');
const apiKeyAuthMiddleware = require('../../../middleware/apiKeyAuth.middleware');
const { requireScope } = require('../../../middleware/scopeAuth.middleware');

router.use(apiKeyAuthMiddleware());

/**
 * GET /api/v1/distribution/identities
 * List trust distribution identities
 * Scope: distribution.read
 */
router.get('/identities', requireScope('distribution.read'), async (req, res) => {
  try {
    const queryParams = parseQueryParams(req.query, ['id', 'created_at']);
    const { status } = req.query;

    const where = {};
    if (status) where.status = status;

    const [identities, total] = await Promise.all([
      defaultPrisma.trustDistributionIdentity.findMany({
        where,
        orderBy: queryParams.orderBy,
        skip: queryParams.skip,
        take: queryParams.limit,
        include: { config: true },
      }),
      defaultPrisma.trustDistributionIdentity.count({ where }),
    ]);

    const pagination = createPaginationMeta(total, queryParams.page, queryParams.limit);

    return sendSuccess(res, {
      statusCode: 200,
      data: identities,
      pagination,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: 500,
      errorCode: 'DISTRIBUTION_FETCH_ERROR',
      message: 'Failed to fetch trust distribution identities.',
      details: err.message,
    });
  }
});

module.exports = router;
