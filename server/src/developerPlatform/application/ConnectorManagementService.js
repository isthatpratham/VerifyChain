/**
 * ConnectorManagementService.js
 * Developer Platform Connector Management Service.
 * Interfaces with Connector Framework to manage installed connectors, connection health,
 * manual synchronization, credential rotation, and disconnections.
 */
const defaultPrisma = require('../../utils/prismaClient');
const { ConnectionManager, SynchronizationEngine, ConnectorProviderRegistry, ConnectorHealthMonitor } = require('../../connectorPlatform');

class ConnectorManagementService {
  /**
   * List installed connectors and active connections for MSME
   */
  async listInstalledConnectors(msmeId = 1) {
    const parsedMsmeId = parseInt(msmeId, 10);

    const connections = await defaultPrisma.integrationConnection.findMany({
      where: { msme_id: parsedMsmeId },
      include: { integration: true },
      orderBy: { created_at: 'desc' },
    });

    const providers = ConnectorProviderRegistry.listProviders();

    return {
      activeConnections: connections,
      availableProviders: providers,
    };
  }

  /**
   * Run health diagnostic on a connection
   */
  async testHealth(connectionId) {
    return ConnectionManager.testConnectionHealth(connectionId);
  }

  /**
   * Trigger data synchronization job
   */
  async triggerSync(connectionId, syncType = 'INCREMENTAL') {
    return SynchronizationEngine.triggerSyncJob({ connectionId, syncType });
  }

  /**
   * Rotate connection credentials
   */
  async rotateCredentials(connectionId, newSecretKey) {
    return ConnectionManager.rotateCredentials(connectionId, newSecretKey);
  }

  /**
   * Remove/Delete connection
   */
  async deleteConnection(connectionId) {
    const id = parseInt(connectionId, 10);
    const conn = await defaultPrisma.integrationConnection.findUnique({ where: { id } });
    if (!conn) throw new Error(`Connection ID ${id} not found.`);

    await defaultPrisma.integrationConnection.delete({ where: { id } });

    await defaultPrisma.integrationAuditLog.create({
      data: {
        actor_type: 'DEVELOPER',
        actor_id: `MSME_${conn.msme_id}`,
        action: 'CONNECTOR_REMOVED',
        resource_type: 'IntegrationConnection',
        resource_id: String(id),
      },
    });

    return { success: true, message: `Connection ${id} deleted.` };
  }
}

module.exports = new ConnectorManagementService();
