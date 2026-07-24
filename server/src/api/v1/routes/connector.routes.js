/**
 * connector.routes.js
 * Connector Framework REST API (/api/v1/connectors).
 * Enables discovering provider capabilities, managing connections, testing connection health,
 * triggering sync jobs, resolving conflicts, and rotating credentials.
 */
const express = require('express');
const router = express.Router();
const {
  ConnectorProviderRegistry,
  ConnectionManager,
  SynchronizationEngine,
  ConnectorHealthMonitor,
  ConnectorAuditService,
} = require('../../../connectorPlatform');
const defaultPrisma = require('../../../utils/prismaClient');
const { sendSuccess, sendError } = require('../../../utils/apiResponse');
const { parseQueryParams, createPaginationMeta } = require('../../../utils/apiQueryParams');
const apiKeyAuthMiddleware = require('../../../middleware/apiKeyAuth.middleware');
const { requireScope } = require('../../../middleware/scopeAuth.middleware');

router.use(apiKeyAuthMiddleware());

/**
 * GET /api/v1/connectors/providers
 * List supported provider capabilities and connector categories
 */
router.get('/providers', requireScope('integration.manage'), (req, res) => {
  const categoryFilter = req.query.category;
  const providers = ConnectorProviderRegistry.listProviders(categoryFilter);
  const categories = ConnectorProviderRegistry.listCategories();

  return sendSuccess(res, {
    statusCode: 200,
    data: {
      categories,
      providers,
    },
  });
});

/**
 * GET /api/v1/connectors/connections/health
 * Check health across all active connections
 */
router.get('/connections/health', requireScope('integration.manage'), async (req, res) => {
  try {
    const healthSummary = await ConnectorHealthMonitor.checkAllConnectionsHealth();
    return sendSuccess(res, { statusCode: 200, data: healthSummary });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'HEALTH_CHECK_ERROR', message: 'Failed to run connection health check.', details: err.message });
  }
});

/**
 * POST /api/v1/connectors/connections
 * Create a new connector connection
 */
router.post('/connections', requireScope('integration.manage'), async (req, res) => {
  try {
    const { integrationId, name, environment, credentials, config } = req.body;

    if (!integrationId) {
      return sendError(res, { statusCode: 400, errorCode: 'INVALID_INPUT', message: 'integrationId is required.' });
    }

    const connectionResult = await ConnectionManager.createConnection({
      integrationId: parseInt(integrationId, 10),
      name,
      environment: environment || 'PRODUCTION',
      credentials,
      config,
    });

    await ConnectorAuditService.logAudit({
      actorType: 'SYSTEM',
      actorId: String(req.developerApp?.msme_id || '1'),
      action: 'CONNECTOR_CREATED',
      connectionId: connectionResult.connection.id,
      changes: { name, environment },
    });

    return sendSuccess(res, { statusCode: 201, data: connectionResult });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'CONNECTOR_CREATE_ERROR', message: 'Failed to create connector connection.', details: err.message });
  }
});

/**
 * GET /api/v1/connectors/connections
 * List active connections
 */
router.get('/connections', requireScope('integration.manage'), async (req, res) => {
  try {
    const queryParams = parseQueryParams(req.query, ['id', 'created_at']);
    const [connections, total] = await Promise.all([
      defaultPrisma.integrationConnection.findMany({
        include: { integration: true },
        orderBy: queryParams.orderBy,
        skip: queryParams.skip,
        take: queryParams.limit,
      }),
      defaultPrisma.integrationConnection.count(),
    ]);

    const pagination = createPaginationMeta(total, queryParams.page, queryParams.limit);
    return sendSuccess(res, { statusCode: 200, data: connections, pagination });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'CONNECTIONS_FETCH_ERROR', message: 'Failed to fetch connections.', details: err.message });
  }
});

/**
 * GET /api/v1/connectors/connections/:id
 * Retrieve specific connection details
 */
router.get('/connections/:id', requireScope('integration.manage'), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const conn = await defaultPrisma.integrationConnection.findUnique({
      where: { id },
      include: { integration: true },
    });

    if (!conn) {
      return sendError(res, { statusCode: 404, errorCode: 'CONNECTION_NOT_FOUND', message: `Connection ID ${id} not found.` });
    }

    return sendSuccess(res, { statusCode: 200, data: conn });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'CONNECTION_FETCH_ERROR', message: 'Failed to fetch connection.', details: err.message });
  }
});

/**
 * POST /api/v1/connectors/connections/:id/test
 * Test connection health & latency
 */
router.post('/connections/:id/test', requireScope('integration.manage'), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const testResult = await ConnectionManager.testConnectionHealth(id);

    return sendSuccess(res, { statusCode: 200, data: testResult });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'TEST_ERROR', message: 'Failed to test connection health.', details: err.message });
  }
});

/**
 * POST /api/v1/connectors/connections/:id/sync
 * Trigger manual data synchronization job
 */
router.post('/connections/:id/sync', requireScope('integration.manage'), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const syncType = req.body.syncType || 'INCREMENTAL';

    const syncResult = await SynchronizationEngine.triggerSyncJob({
      connectionId: id,
      syncType,
    });

    await ConnectorAuditService.logAudit({
      actorType: 'SYSTEM',
      actorId: String(req.developerApp?.msme_id || '1'),
      action: 'SYNC_JOB_EXECUTED',
      connectionId: id,
      changes: { jobId: syncResult.jobId, syncType, status: syncResult.status },
    });

    return sendSuccess(res, { statusCode: 200, data: syncResult });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'SYNC_ERROR', message: 'Failed to trigger sync job.', details: err.message });
  }
});

/**
 * POST /api/v1/connectors/connections/:id/rotate-credentials
 * Rotate connection credentials
 */
router.post('/connections/:id/rotate-credentials', requireScope('integration.manage'), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { newSecret } = req.body;

    if (!newSecret) {
      return sendError(res, { statusCode: 400, errorCode: 'INVALID_SECRET', message: 'newSecret key is required.' });
    }

    const rotateResult = await ConnectionManager.rotateCredentials(id, newSecret);

    await ConnectorAuditService.logAudit({
      actorType: 'SYSTEM',
      actorId: String(req.developerApp?.msme_id || '1'),
      action: 'CREDENTIALS_ROTATED',
      connectionId: id,
    });

    return sendSuccess(res, { statusCode: 200, data: rotateResult });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'ROTATE_ERROR', message: 'Failed to rotate credentials.', details: err.message });
  }
});

/**
 * POST /api/v1/connectors/conflicts/:conflictId/resolve
 * Resolve a synchronization conflict
 */
router.post('/conflicts/:conflictId/resolve', requireScope('integration.manage'), async (req, res) => {
  try {
    const { conflictId } = req.params;
    const strategy = req.body.strategy || 'RESOLVED_SOURCE';

    const resolution = await SynchronizationEngine.resolveConflict(conflictId, strategy);

    return sendSuccess(res, { statusCode: 200, data: resolution });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'CONFLICT_RESOLVE_ERROR', message: 'Failed to resolve conflict.', details: err.message });
  }
});

/**
 * DELETE /api/v1/connectors/connections/:id
 * Disconnect / delete connection
 */
router.delete('/connections/:id', requireScope('integration.manage'), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const conn = await defaultPrisma.integrationConnection.findUnique({ where: { id } });

    if (!conn) {
      return sendError(res, { statusCode: 404, errorCode: 'CONNECTION_NOT_FOUND', message: `Connection ID ${id} not found.` });
    }

    await defaultPrisma.integrationConnection.delete({ where: { id } });

    await ConnectorAuditService.logAudit({
      actorType: 'SYSTEM',
      actorId: String(req.developerApp?.msme_id || '1'),
      action: 'CONNECTOR_DELETED',
      connectionId: id,
    });

    return sendSuccess(res, { statusCode: 200, data: { message: `Connection ${id} deleted.` } });
  } catch (err) {
    return sendError(res, { statusCode: 500, errorCode: 'CONNECTOR_DELETE_ERROR', message: 'Failed to delete connection.', details: err.message });
  }
});

module.exports = router;
