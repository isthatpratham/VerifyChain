/**
 * aiAdmin.routes.js
 * REST API Endpoint Router for AI Operations Center & Governance (Phase 11.4).
 */

const express = require('express');
const router = express.Router();
const AIAdminFacade = require('../../../aiAdmin/AIAdminFacade');
const { sendSuccess, sendError } = require('../../../utils/apiResponse');

// 1. AI Operations Center Dashboard Stats
router.get('/dashboard/stats', async (req, res) => {
  try {
    const stats = await AIAdminFacade.getAIDashboardStats();
    return sendSuccess(res, stats, 'AI Operations Center metrics fetched.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

// 2. Provider Registry
router.get('/providers', async (req, res) => {
  try {
    const providers = await AIAdminFacade.listProviders();
    return sendSuccess(res, providers, 'AI Provider registry listed.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

router.put('/providers/:key', async (req, res) => {
  try {
    const updated = await AIAdminFacade.updateProvider({
      key: req.params.key,
      ...req.body,
    });
    return sendSuccess(res, updated, 'AI Provider settings updated.');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

// 3. Model Catalog
router.get('/models', async (req, res) => {
  try {
    const models = await AIAdminFacade.listModels();
    return sendSuccess(res, models, 'AI Model catalog listed.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

// 4. Prompt Library & Versioning
router.get('/prompts', async (req, res) => {
  try {
    const prompts = await AIAdminFacade.listPrompts(req.query.category);
    return sendSuccess(res, prompts, 'AI Prompt catalog listed.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

router.post('/prompts', async (req, res) => {
  try {
    const result = await AIAdminFacade.createPrompt(req.body);
    return sendSuccess(res, result, 'New AI Prompt created.', 201);
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

router.post('/prompts/:id/versions', async (req, res) => {
  try {
    const newVersion = await AIAdminFacade.createNewVersion({
      promptId: req.params.id,
      ...req.body,
      authorId: req.user?.id ? `USER_${req.user.id}` : 'ADMIN',
    });
    return sendSuccess(res, newVersion, 'New prompt version published.', 201);
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

router.post('/prompts/:id/rollback', async (req, res) => {
  try {
    const rolledBack = await AIAdminFacade.rollbackPrompt(
      req.params.id,
      req.body.versionNumber,
      req.user?.id ? `USER_${req.user.id}` : 'ADMIN'
    );
    return sendSuccess(res, rolledBack, 'Prompt rolled back to historical version.');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

// 5. Quota Management & AI Policies
router.get('/quotas', async (req, res) => {
  try {
    const quotas = await AIAdminFacade.listQuotas(req.query.scopeType);
    return sendSuccess(res, quotas, 'AI Quotas listed.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

router.post('/quotas', async (req, res) => {
  try {
    const quota = await AIAdminFacade.setQuota(req.body);
    return sendSuccess(res, quota, 'AI Quota configured.');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

router.get('/policies', async (req, res) => {
  try {
    const policies = await AIAdminFacade.listPolicies();
    return sendSuccess(res, policies, 'AI Policies listed.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

router.put('/policies/:code', async (req, res) => {
  try {
    const policy = await AIAdminFacade.updatePolicy({
      code: req.params.code,
      ...req.body,
    });
    return sendSuccess(res, policy, 'AI Policy updated.');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

// 6. Configuration & Audit Logs
router.get('/config', async (req, res) => {
  try {
    const configs = await AIAdminFacade.listConfigs(req.query.category);
    return sendSuccess(res, configs, 'AI Platform configurations listed.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

router.post('/config', async (req, res) => {
  try {
    const config = await AIAdminFacade.updateConfig({
      ...req.body,
      updatedBy: req.user?.id ? `USER_${req.user.id}` : 'ADMIN',
    });
    return sendSuccess(res, config, 'AI Configuration updated.');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
});

router.get('/audits', async (req, res) => {
  try {
    const audits = await AIAdminFacade.listEvents(req.query.limit);
    return sendSuccess(res, audits, 'AI Governance audit events listed.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

module.exports = router;
