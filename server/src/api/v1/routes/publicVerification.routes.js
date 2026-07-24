/**
 * publicVerification.routes.js
 * Public Verification REST API (/api/v1/verify).
 * Exposes enterprise verification status, public trust profiles, and distribution assets.
 */
const express = require('express');
const router = express.Router();
const supplierTrustService = require('../../../services/supplierTrust.service');
const { sendSuccess, sendError } = require('../../../utils/apiResponse');
const apiKeyAuthMiddleware = require('../../../middleware/apiKeyAuth.middleware');
const { requireScope } = require('../../../middleware/scopeAuth.middleware');

// Public route allows unauthenticated access or optional API key with public.verify scope
router.use(apiKeyAuthMiddleware({ optional: true }));
router.use(requireScope('public.verify'));

/**
 * GET /api/v1/verify/:slug
 * Retrieve public trust verification profile by slug or public identifier
 */
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const profile = await supplierTrustService.getTrustProfileBySlug(slug);

    if (!profile) {
      return sendError(res, {
        statusCode: 404,
        errorCode: 'PROFILE_NOT_FOUND',
        message: `Supplier trust profile '${slug}' was not found or is not public.`,
      });
    }

    return sendSuccess(res, {
      statusCode: 200,
      data: profile,
      metadata: {
        verifiedAt: new Date().toISOString(),
        verificationAuthority: 'VerifyChain Enterprise Platform',
      },
    });
  } catch (err) {
    if (err.message && err.message.includes('not found')) {
      return sendError(res, {
        statusCode: 404,
        errorCode: 'PROFILE_NOT_FOUND',
        message: err.message,
      });
    }
    return sendError(res, {
      statusCode: 500,
      errorCode: 'VERIFICATION_ERROR',
      message: 'Failed to resolve public verification profile.',
      details: err.message,
    });
  }
});

/**
 * GET /api/v1/verify/:slug/assets
 * Retrieve public trust distribution assets (QR code, badge HTML, widget snippet, certificate link)
 */
router.get('/:slug/assets', async (req, res) => {
  try {
    const { slug } = req.params;
    const profile = await supplierTrustService.getTrustProfileBySlug(slug);

    if (!profile) {
      return sendError(res, {
        statusCode: 404,
        errorCode: 'PROFILE_NOT_FOUND',
        message: `Supplier trust profile '${slug}' was not found.`,
      });
    }

    return sendSuccess(res, {
      statusCode: 200,
      data: {
        publicSlug: profile.public_slug,
        publicIdentifier: profile.public_identifier,
        distribution: profile.distribution,
      },
    });
  } catch (err) {
    if (err.message && err.message.includes('not found')) {
      return sendError(res, {
        statusCode: 404,
        errorCode: 'PROFILE_NOT_FOUND',
        message: err.message,
      });
    }
    return sendError(res, {
      statusCode: 500,
      errorCode: 'ASSET_RESOLVE_ERROR',
      message: 'Failed to resolve public trust distribution assets.',
      details: err.message,
    });
  }
});

module.exports = router;
