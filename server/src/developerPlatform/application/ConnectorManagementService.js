/**
 * ConnectorManagementService.js
 * Developer Platform Connector Management Service.
 * Interfaces with Connector Framework to manage provider registry, installed connectors,
 * connection lifecycle (connect, enable/disable, reconnect, disconnect), health monitoring,
 * background synchronization, credential storage, and audit logs.
 */
const defaultPrisma = require('../../utils/prismaClient');
const { ConnectionManager, SynchronizationEngine, ConnectorProviderRegistry, ConnectorHealthMonitor } = require('../../connectorPlatform');

class ConnectorManagementService {
  /**
   * Helper to ensure default integrations exist in DB for registry catalog
   */
  async _seedDefaultIntegrations() {
    const defaultIntegrations = [
      { name: 'SAP S/4HANA Enterprise ERP', provider_code: 'SAP_ERP', category: 'ERP', description: 'Enterprise ERP for financial, inventory, and procurement synchronization.' },
      { name: 'Salesforce Enterprise CRM', provider_code: 'SALESFORCE_CRM', category: 'CRM', description: 'CRM adapter for customer, account, and deal pipeline synchronization.' },
      { name: 'GST Statutory Portal', provider_code: 'GSTIN_GOV_PORTAL', category: 'GOVERNMENT', description: 'Statutory government portal adapter for tax compliance verification.' },
      { name: 'Tally Prime ERP', provider_code: 'TALLY_ERP', category: 'ERP', description: 'Small business ERP adapter for ledger and invoice synchronization.' },
      { name: 'Zoho CRM Adapter', provider_code: 'ZOHO_CRM', category: 'CRM', description: 'Zoho suite CRM connector for lead and contact synchronization.' },
    ];

    for (const item of defaultIntegrations) {
      const existing = await defaultPrisma.integration.findFirst({ where: { provider_code: item.provider_code } });
      if (!existing) {
        await defaultPrisma.integration.create({
          data: {
            name: item.name,
            provider_code: item.provider_code,
            category: item.category,
            description: item.description,
            is_active: true,
          },
        });
      }
    }
  }

  /**
   * List installed connectors and available provider registry for MSME
   */
  async listInstalledConnectors(msmeId = 1) {
    const parsedMsmeId = parseInt(msmeId, 10);
    await this._seedDefaultIntegrations();

    const connections = await defaultPrisma.integrationConnection.findMany({
      where: { msme_id: parsedMsmeId },
      include: { integration: true },
      orderBy: { created_at: 'desc' },
    });

    const providers = ConnectorProviderRegistry.listProviders();

    return {
      activeConnections: connections.map(c => ({
        ...c,
        lastConnectedFormatted: c.last_connected_at ? new Date(c.last_connected_at).toLocaleString() : 'Never',
      })),
      availableProviders: providers,
    };
  }

  /**
   * Connect a new Provider integration
   */
  async connectProvider({ msmeId = 1, providerCode, name, environment = 'PRODUCTION', credentials = {}, config = {} }) {
    await this._seedDefaultIntegrations();
    const targetIntegration = await defaultPrisma.integration.findFirst({
      where: { provider_code: providerCode },
    });

    if (!targetIntegration) {
      throw new Error(`Integration provider '${providerCode}' not registered.`);
    }

    const result = await ConnectionManager.createConnection({
      integrationId: targetIntegration.id,
      name: name || `${targetIntegration.name} (${environment})`,
      msmeId,
      environment,
      credentials,
      config,
    });

    await defaultPrisma.integrationAuditLog.create({
      data: {
        actor_type: 'DEVELOPER',
        actor_id: `MSME_${msmeId}`,
        action: 'CONNECTOR_INSTALLED',
        resource_type: 'IntegrationConnection',
        resource_id: String(result.connection.id),
        changes_json: { providerCode, environment, name },
      },
    });

    return result;
  }

  /**
   * Toggle connection enable/disable state
   */
  async toggleConnectionStatus(connectionId) {
    const id = parseInt(connectionId, 10);
    const conn = await defaultPrisma.integrationConnection.findUnique({ where: { id } });
    if (!conn) throw new Error(`Connection ID ${id} not found.`);

    const nextStatus = conn.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    const updated = await defaultPrisma.integrationConnection.update({
      where: { id },
      data: { status: nextStatus },
    });

    await defaultPrisma.integrationAuditLog.create({
      data: {
        actor_type: 'DEVELOPER',
        actor_id: `MSME_${conn.msme_id}`,
        action: nextStatus === 'ACTIVE' ? 'CONNECTOR_ENABLED' : 'CONNECTOR_DISABLED',
        resource_type: 'IntegrationConnection',
        resource_id: String(id),
        changes_json: { status: nextStatus },
      },
    });

    return updated;
  }

  /**
   * Run health diagnostic on a connection (Reconnect / Health Check)
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
   * Get sync & event logs for a connection
   */
  async getConnectionLogs(connectionId, limit = 50) {
    const id = parseInt(connectionId, 10);
    const conn = await defaultPrisma.integrationConnection.findUnique({ where: { id } });
    if (!conn) throw new Error(`Connection ID ${id} not found.`);

    return defaultPrisma.integrationEventLog.findMany({
      where: { integration_id: conn.integration_id },
      take: limit,
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Disconnect / Delete connection
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

    return { success: true, message: `Connection ${id} disconnected and removed successfully.` };
  }
}

module.exports = new ConnectorManagementService();
