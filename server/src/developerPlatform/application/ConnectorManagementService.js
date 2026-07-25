/**
 * ConnectorManagementService.js
 * Developer Platform Connector Management Service.
 * Interfaces with Connector Framework to manage provider registry, installed connectors,
 * connection lifecycle (connect, enable/disable, reconnect, disconnect), health monitoring,
 * background synchronization, credential storage, and audit logs.
 */
const defaultPrisma = require('../../utils/prismaClient');
const { ConnectionManager, SynchronizationEngine, ConnectorProviderRegistry, ProviderRegistryInitializer } = require('../../connectorPlatform');

class ConnectorManagementService {
  /**
   * Helper to ensure built-in providers are initialized in DB for registry catalog
   */
  async _seedDefaultIntegrations() {
    await ProviderRegistryInitializer.initialize(defaultPrisma);
  }

  /**
   * List installed connectors and available provider registry for MSME
   */
  async listInstalledConnectors(msmeId = 1, categoryFilter = null) {
    const parsedMsmeId = parseInt(msmeId, 10);
    await this._seedDefaultIntegrations();

    // 1. Fetch active customer connections for this MSME
    const connections = await defaultPrisma.integrationConnection.findMany({
      where: { msme_id: parsedMsmeId },
      include: { integration: true },
      orderBy: { created_at: 'desc' },
    });

    // 2. Fetch available integration providers from database
    const dbIntegrations = await defaultPrisma.integration.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { id: 'asc' },
    });

    // Calculate active connection count per provider for this MSME
    const activeConnectionsMap = new Map();
    connections.forEach((conn) => {
      const pCode = conn.integration?.provider_code;
      if (pCode) {
        activeConnectionsMap.set(pCode, (activeConnectionsMap.get(pCode) || 0) + 1);
      }
    });

    // 3. Format providers with rich metadata
    let providers = dbIntegrations.map((item) => {
      const meta = item.metadata || {};
      const activeCount = activeConnectionsMap.get(item.provider_code) || 0;
      return {
        id: item.id,
        integrationId: item.integration_id,
        providerCode: item.provider_code,
        name: item.name,
        category: meta.category || item.type,
        type: item.type,
        description: item.description,
        logo: meta.logo || 'RestApi',
        version: item.version,
        status: item.status,
        capabilities: item.capabilities || [],
        supportedAuthMethods: meta.supportedAuthMethods || ['OAUTH2', 'API_KEY'],
        supportedResources: meta.supportedResources || ['GeneralData'],
        docUrl: meta.docUrl || 'https://docs.verifychain.io/connectors',
        healthSupport: meta.healthSupport !== false,
        webhookSupport: meta.webhookSupport || false,
        syncSupport: meta.syncSupport || { enabled: true, modes: ['FULL', 'INCREMENTAL'] },
        featureFlags: meta.featureFlags || {},
        configSchema: meta.configSchema || null,
        extensibility: meta.extensibility || {},
        activeConnectionCount: activeCount,
        isConnected: activeCount > 0,
      };
    });

    // Filter by category if requested
    if (categoryFilter && categoryFilter.toUpperCase() !== 'ALL') {
      providers = providers.filter((p) => p.category.toUpperCase() === categoryFilter.toUpperCase());
    }

    // Combine with in-memory providers if any exist outside DB
    const memProviders = ConnectorProviderRegistry.listProviders(categoryFilter);
    const existingCodes = new Set(providers.map((p) => p.providerCode));
    for (const memP of memProviders) {
      if (!existingCodes.has(memP.providerCode)) {
        providers.push({
          ...memP,
          activeConnectionCount: 0,
          isConnected: false,
        });
      }
    }

    return {
      activeConnections: connections.map((c) => ({
        ...c,
        lastConnectedFormatted: c.last_connected_at ? new Date(c.last_connected_at).toLocaleString() : 'Never',
        lastSyncedFormatted: c.last_synced_at ? new Date(c.last_synced_at).toLocaleString() : 'Never',
        providerCode: c.integration?.provider_code,
        providerName: c.integration?.name,
        category: c.integration?.metadata?.category || c.integration?.type,
        logo: c.integration?.metadata?.logo || 'RestApi',
      })),
      availableProviders: providers,
    };
  }

  /**
   * Connect a new Provider integration
   */
  async connectProvider({ msmeId = 1, providerCode, name, environment = 'PRODUCTION', credentials = {}, config = {} }) {
    await this._seedDefaultIntegrations();
    let targetIntegration = await defaultPrisma.integration.findFirst({
      where: { provider_code: providerCode },
    });

    if (!targetIntegration) {
      // Case-insensitive fallback lookup
      targetIntegration = await defaultPrisma.integration.findFirst({
        where: { provider_code: { equals: providerCode, mode: 'insensitive' } },
      });
    }

    if (!targetIntegration) {
      throw new Error(`Integration provider '${providerCode}' not registered in platform catalog.`);
    }

    const result = await ConnectionManager.createConnection({
      integrationId: targetIntegration.id,
      name: name || `${targetIntegration.name} (${environment})`,
      msmeId: parseInt(msmeId, 10),
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
