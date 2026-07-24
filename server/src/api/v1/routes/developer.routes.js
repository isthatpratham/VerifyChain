/**
 * developer.routes.js
 * Developer Platform & API Key Management REST API (/api/v1/developer).
 * Operations to register developer applications, generate API keys, rotate keys, and revoke keys.
 */
const express = require('express');
const router = express.Router();
const { ApiKeyManager, SCOPES, validateScopes, IntegrationAuditService } = require('../../../integrationPlatform');
const { developerAppRepository, apiKeyRepository } = require('../../../repositories');
const { sendSuccess, sendError } = require('../../../utils/apiResponse');
const apiKeyAuthMiddleware = require('../../../middleware/apiKeyAuth.middleware');
const { requireScope } = require('../../../middleware/scopeAuth.middleware');

router.use(apiKeyAuthMiddleware({ optional: true }));

/**
 * POST /api/v1/developer/apps
 * Register developer application
 */
router.post('/apps', async (req, res) => {
  try {
    const { msmeId, name, description, environment } = req.body;

    if (!name || typeof name !== 'string') {
      return sendError(res, { statusCode: 400, errorCode: 'INVALID_INPUT', message: 'Application name is required.' });
    }

    const appId = `APP-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const devApp = await developerAppRepository.create({
      msme_id: msmeId || req.msmeId || 1,
      app_id: appId,
      name: name.trim(),
      description: description || null,
      environment: environment || 'SANDBOX',
    });

    await IntegrationAuditService.logAuditAction({
      actorType: 'SYSTEM',
      actorId: String(devApp.msme_id),
      action: 'DEVELOPER_APP_CREATED',
      resourceType: 'DeveloperApplication',
      resourceId: String(devApp.id),
      changes: { appId, name: devApp.name },
    });

    return sendSuccess(res, { statusCode: 201, data: devApp });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'APP_CREATE_ERROR', message: 'Failed to create developer application.', details: err.message });
  }
});

/**
 * POST /api/v1/developer/keys
 * Generate new high-entropy API key pair (returns raw Key ONLY ONCE)
 */
router.post('/keys', async (req, res) => {
  try {
    const { developerAppId, name, environment, scopes } = req.body;

    if (!developerAppId) {
      return sendError(res, { statusCode: 400, errorCode: 'INVALID_INPUT', message: 'developerAppId is required.' });
    }

    const app = await developerAppRepository.findById(parseInt(developerAppId, 10));
    if (!app) {
      return sendError(res, { statusCode: 404, errorCode: 'APP_NOT_FOUND', message: `Developer Application ID ${developerAppId} not found.` });
    }

    const keyScopes = Array.isArray(scopes) && scopes.length > 0 ? scopes : [SCOPES.BUSINESS_READ, SCOPES.TRUST_READ, SCOPES.PUBLIC_VERIFY];

    if (!validateScopes(keyScopes)) {
      return sendError(res, { statusCode: 400, errorCode: 'INVALID_SCOPES', message: 'One or more provided scopes are unrecognized.' });
    }

    const env = environment || app.environment || 'PRODUCTION';
    const keyPair = ApiKeyManager.generateKeyPair(env);

    const apiKeyRecord = await apiKeyRepository.create({
      developer_app_id: app.id,
      key_prefix: keyPair.keyPrefix,
      key_hash: keyPair.keyHash,
      name: name || `${env} API Key`,
      environment: env,
      scopes: keyScopes,
      status: 'ACTIVE',
    });

    await IntegrationAuditService.logAuditAction({
      actorType: 'SYSTEM',
      actorId: String(app.msme_id),
      action: 'API_KEY_CREATED',
      resourceType: 'ApiKey',
      resourceId: String(apiKeyRecord.id),
      changes: { keyPrefix: keyPair.keyPrefix, scopes: keyScopes },
    });

    return sendSuccess(res, {
      statusCode: 201,
      data: {
        id: apiKeyRecord.id,
        developerAppId: app.id,
        name: apiKeyRecord.name,
        environment: apiKeyRecord.environment,
        scopes: apiKeyRecord.scopes,
        status: apiKeyRecord.status,
        createdAt: apiKeyRecord.created_at,
        // RETURN RAW API KEY ONLY ONCE
        rawApiKey: keyPair.rawKey,
        warning: 'Store this raw API key safely. It will NEVER be shown again.',
      },
    });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'KEY_GENERATE_ERROR', message: 'Failed to generate API key.', details: err.message });
  }
});

/**
 * GET /api/v1/developer/keys
 * List active keys for developer application
 */
router.get('/keys', async (req, res) => {
  try {
    const appId = parseInt(req.query.developerAppId, 10);
    if (isNaN(appId)) {
      return sendError(res, { statusCode: 400, errorCode: 'INVALID_INPUT', message: 'developerAppId query parameter is required.' });
    }

    const keys = await apiKeyRepository.findByDeveloperAppId(appId);

    // Sanitize output (never expose key_hash)
    const sanitized = keys.map((k) => ({
      id: k.id,
      keyPrefix: k.key_prefix,
      name: k.name,
      environment: k.environment,
      scopes: k.scopes,
      status: k.status,
      expiresAt: k.expires_at,
      lastUsedAt: k.last_used_at,
      revokedAt: k.revoked_at,
      createdAt: k.created_at,
    }));

    return sendSuccess(res, { statusCode: 200, data: sanitized });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'KEY_FETCH_ERROR', message: 'Failed to fetch API keys.', details: err.message });
  }
});

/**
 * POST /api/v1/developer/keys/:id/rotate
 * Rotate API Key
 */
router.post('/keys/:id/rotate', async (req, res) => {
  try {
    const keyId = parseInt(req.params.id, 10);
    const oldKey = await apiKeyRepository.findById(keyId);

    if (!oldKey) {
      return sendError(res, { statusCode: 404, errorCode: 'KEY_NOT_FOUND', message: `API Key ID ${keyId} not found.` });
    }

    // Mark old key rotated
    await apiKeyRepository.update({ id: oldKey.id }, { status: 'ROTATED', revoked_at: new Date(), revocation_reason: 'Key Rotated' });

    // Issue replacement key
    const newKeyPair = ApiKeyManager.generateKeyPair(oldKey.environment);
    const newKey = await apiKeyRepository.create({
      developer_app_id: oldKey.developer_app_id,
      key_prefix: newKeyPair.keyPrefix,
      key_hash: newKeyPair.keyHash,
      name: `${oldKey.name} (Rotated)`,
      environment: oldKey.environment,
      scopes: oldKey.scopes,
      status: 'ACTIVE',
    });

    await IntegrationAuditService.logAuditAction({
      actorType: 'SYSTEM',
      actorId: String(oldKey.developer_app_id),
      action: 'API_KEY_ROTATED',
      resourceType: 'ApiKey',
      resourceId: String(newKey.id),
      changes: { rotatedFromId: oldKey.id },
    });

    return sendSuccess(res, {
      statusCode: 200,
      data: {
        newKeyId: newKey.id,
        rawApiKey: newKeyPair.rawKey,
        warning: 'Store this new raw API key safely. It will NEVER be shown again.',
      },
    });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'ROTATE_ERROR', message: 'Failed to rotate API key.', details: err.message });
  }
});

/**
 * POST /api/v1/developer/keys/:id/revoke
 * Revoke API Key
 */
router.post('/keys/:id/revoke', async (req, res) => {
  try {
    const keyId = parseInt(req.params.id, 10);
    const { reason } = req.body;
    const key = await apiKeyRepository.findById(keyId);

    if (!key) {
      return sendError(res, { statusCode: 404, errorCode: 'KEY_NOT_FOUND', message: `API Key ID ${keyId} not found.` });
    }

    const updated = await apiKeyRepository.update(
      { id: key.id },
      { status: 'REVOKED', revoked_at: new Date(), revocation_reason: reason || 'User Revoked' }
    );

    await IntegrationAuditService.logAuditAction({
      actorType: 'SYSTEM',
      actorId: String(key.developer_app_id),
      action: 'API_KEY_REVOKED',
      resourceType: 'ApiKey',
      resourceId: String(key.id),
      changes: { reason },
    });

    return sendSuccess(res, { statusCode: 200, data: { id: updated.id, status: updated.status, revokedAt: updated.revoked_at } });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'REVOKE_ERROR', message: 'Failed to revoke API key.', details: err.message });
  }
});

module.exports = router;
