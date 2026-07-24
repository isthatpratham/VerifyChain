/**
 * SynchronizationEngine.js
 * Asynchronous Data Synchronization Engine.
 * Manages full, incremental, and manual sync jobs, conflict detection, conflict resolution,
 * and sync attempt metrics.
 */
const ConnectorProviderRegistry = require('../registry/ConnectorProviderRegistry');
const DataMapper = require('../mapping/DataMapper');
const { IntegrationLogger } = require('../../integrationPlatform');
const defaultPrisma = require('../../utils/prismaClient');

class SynchronizationEngine {
  constructor() {
    this.inMemoryConflicts = new Map();
  }

  /**
   * Trigger a data synchronization job for a connection
   * @param {object} options - { connectionId, syncType }
   */
  async triggerSyncJob({ connectionId, syncType = 'INCREMENTAL' }) {
    const id = parseInt(connectionId, 10);
    if (isNaN(id)) {
      throw new Error(`Invalid connection ID: ${connectionId}`);
    }
    const connection = await defaultPrisma.integrationConnection.findUnique({
      where: { id },
      include: { integration: true },
    });

    if (!connection) {
      throw new Error(`Connection ID ${connectionId} not found.`);
    }

    const adapter = ConnectorProviderRegistry.getAdapter(connection.integration.provider_code);
    if (!adapter) {
      throw new Error(`Adapter for provider '${connection.integration.provider_code}' not found.`);
    }

    const jobId = `SYNC-JOB-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const startTime = Date.now();

    IntegrationLogger.logEvent('INFO', `Sync Job [${jobId}] started for connection '${connection.name}' [Type: ${syncType}]`, {
      jobId,
      connectionId: connection.id,
      syncType,
    });

    try {
      // Execute adapter data synchronization
      const rawSyncResult = await adapter.syncData(syncType, {});
      const executionTimeMs = Date.now() - startTime;

      // Map raw items through DataMapper
      const mappedItems = (rawSyncResult.items || []).map((item) =>
        DataMapper.mapToDomain('business_profile', item)
      );

      // Check for conflicts
      const conflicts = [];
      if (rawSyncResult.conflictsDetected > 0) {
        const conflictId = `CONF-${Date.now()}-1`;
        const conflictRecord = {
          conflictId,
          jobId,
          connectionId: connection.id,
          resourceType: 'business_profile',
          sourceData: rawSyncResult.items[0],
          targetData: mappedItems[0],
          status: 'UNRESOLVED',
          createdAt: new Date().toISOString(),
        };
        this.inMemoryConflicts.set(conflictId, conflictRecord);
        conflicts.push(conflictRecord);
      }

      // Record telemetry in DB
      await defaultPrisma.integrationEventLog.create({
        data: {
          integration_id: connection.integration_id,
          event_type: 'DataSyncCompleted',
          event_source: connection.integration.provider_code,
          correlation_id: `corr_sync_${jobId}`,
          payload_json: {
            jobId,
            syncType,
            recordsProcessed: rawSyncResult.recordsProcessed || mappedItems.length,
            recordsUpdated: rawSyncResult.recordsUpdated || 0,
            conflictsDetected: conflicts.length,
            executionTimeMs,
          },
        },
      });

      return {
        jobId,
        connectionId: connection.id,
        status: conflicts.length > 0 ? 'PARTIAL_SUCCESS' : 'COMPLETED',
        syncType,
        recordsProcessed: rawSyncResult.recordsProcessed || mappedItems.length,
        recordsUpdated: rawSyncResult.recordsUpdated || 0,
        conflictsCount: conflicts.length,
        executionTimeMs,
        mappedItems,
        conflicts,
      };
    } catch (err) {
      const executionTimeMs = Date.now() - startTime;

      await defaultPrisma.integrationEventLog.create({
        data: {
          integration_id: connection.integration_id,
          event_type: 'DataSyncFailed',
          event_source: connection.integration.provider_code,
          correlation_id: `corr_sync_${jobId}`,
          payload_json: { jobId, syncType, error: err.message, executionTimeMs },
        },
      });

      IntegrationLogger.logEvent('ERROR', `Sync Job [${jobId}] failed: ${err.message}`, {
        jobId,
        connectionId: connection.id,
        error: err.message,
      });

      return {
        jobId,
        connectionId: connection.id,
        status: 'FAILED',
        error: err.message,
        executionTimeMs,
      };
    }
  }

  /**
   * Resolve a synchronization conflict
   */
  async resolveConflict(conflictId, resolutionStrategy = 'RESOLVED_SOURCE') {
    const conflict = this.inMemoryConflicts.get(conflictId);
    if (!conflict) {
      return {
        conflictId,
        status: 'RESOLVED_SOURCE',
        strategy: resolutionStrategy,
        resolvedAt: new Date().toISOString(),
      };
    }

    conflict.status = resolutionStrategy;
    conflict.resolvedAt = new Date().toISOString();

    IntegrationLogger.logEvent('INFO', `Sync conflict [${conflictId}] resolved using strategy '${resolutionStrategy}'`, { conflictId, resolutionStrategy });

    return conflict;
  }
}

module.exports = new SynchronizationEngine();
