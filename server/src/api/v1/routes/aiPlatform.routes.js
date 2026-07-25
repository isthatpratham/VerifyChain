/**
 * aiPlatform.routes.js
 * Internal REST API Routes for VerifyChain Enterprise AI Platform.
 */

const express = require('express');
const { AIService } = require('../../../aiPlatform');
const { requireScope } = require('../../../middleware/scopeAuth.middleware');
const { sendSuccess, sendError } = require('../../../utils/apiResponse');

const router = express.Router();

/**
 * Execute AI Prompt Template
 * POST /api/v1/ai/execute
 */
router.post('/execute', requireScope('ai.use'), async (req, res) => {
  try {
    const { templateCode, version, variables, domains, providerCode, modelCode } = req.body;
    const msmeId = req.msmeId || req.user?.msmeId || req.body.msmeId || 1;
    const userId = req.user?.id ? `USER_${req.user.id}` : 'SYSTEM';

    if (!templateCode) {
      return sendError(res, { statusCode: 400, errorCode: 'MISSING_TEMPLATE_CODE', message: 'templateCode is required.' });
    }

    const response = await AIService.executePrompt({
      templateCode,
      version: version || 1,
      variables: variables || {},
      msmeId,
      userId,
      domains: domains || ['BUSINESS', 'COMPLIANCE', 'TRUST'],
      providerCode,
      modelCode,
    });

    return sendSuccess(res, { statusCode: 200, data: response.toDict() });
  } catch (err) {
    return sendError(res, { statusCode: err.statusCode || 500, errorCode: err.errorCode || 'AI_EXECUTION_ERROR', message: err.message, details: err.details });
  }
});

/**
 * Build Unified Context
 * POST /api/v1/ai/context
 */
router.post('/context', requireScope('ai.use'), async (req, res) => {
  try {
    const { domains } = req.body;
    const msmeId = req.msmeId || req.user?.msmeId || req.body.msmeId || 1;
    const userId = req.user?.id ? `USER_${req.user.id}` : 'SYSTEM';

    const context = await AIService.buildContext({ msmeId, userId, domains });
    return sendSuccess(res, { statusCode: 200, data: context });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'AI_CONTEXT_ERROR', message: 'Failed to build AI context.', details: err.message });
  }
});

/**
 * Get Model Registry & Capabilities
 * GET /api/v1/ai/models
 */
router.get('/models', requireScope('ai.use'), async (req, res) => {
  try {
    const models = await AIService.getModelRegistry();
    return sendSuccess(res, { statusCode: 200, data: models });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'AI_MODELS_ERROR', message: 'Failed to fetch AI models.', details: err.message });
  }
});

/**
 * Get Provider Status & Health
 * GET /api/v1/ai/providers
 */
router.get('/providers', requireScope('ai.admin'), async (req, res) => {
  try {
    const providers = AIService.getProviders();
    return sendSuccess(res, { statusCode: 200, data: providers });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'AI_PROVIDERS_ERROR', message: 'Failed to fetch AI providers.', details: err.message });
  }
});

/**
 * Get Token Accounting & Usage Analytics
 * GET /api/v1/ai/analytics
 */
router.get('/analytics', requireScope('ai.analytics'), async (req, res) => {
  try {
    const msmeId = req.msmeId || req.user?.msmeId || req.query.msmeId || 1;
    const analytics = await AIService.getUsageAnalytics({ msmeId });
    return sendSuccess(res, { statusCode: 200, data: analytics });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'AI_ANALYTICS_ERROR', message: 'Failed to fetch AI analytics.', details: err.message });
  }
});

/**
 * Get AI Audit Logs
 * GET /api/v1/ai/audit
 */
router.get('/audit', requireScope('ai.admin'), async (req, res) => {
  try {
    const msmeId = req.msmeId || req.user?.msmeId || req.query.msmeId || 1;
    const logs = await AIService.getAuditLogs({ msmeId, limit: 50 });
    return sendSuccess(res, { statusCode: 200, data: logs });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'AI_AUDIT_ERROR', message: 'Failed to fetch AI audit logs.', details: err.message });
  }
});

/**
 * Get / Update AI Configuration
 * GET/PUT /api/v1/ai/config
 */
router.get('/config', requireScope('ai.configuration'), (req, res) => {
  return sendSuccess(res, { statusCode: 200, data: AIService.getConfig() });
});

router.put('/config', requireScope('ai.configuration'), (req, res) => {
  try {
    const updated = AIService.updateConfig(req.body);
    return sendSuccess(res, { statusCode: 200, data: updated });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'AI_CONFIG_ERROR', message: 'Failed to update AI configuration.', details: err.message });
  }
});

module.exports = router;
