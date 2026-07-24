/**
 * ConnectionManager.js
 * Connector Connection Lifecycle Manager.
 * Handles connection creation, credential encryption (AES-256-GCM), testing connection health,
 * state transitions, and credential rotation.
 */
const ConnectorProviderRegistry = require('../registry/ConnectorProviderRegistry');
const { encryptSecret, IntegrationLogger } = require('../../integrationPlatform');
const defaultPrisma = require('../../utils/prismaClient');

class ConnectionManager {
  /**
   * Create a new connector connection in PostgreSQL
   */
  async createConnection({
    integrationId,
    name,
    msmeId = 1,
    environment = 'PRODUCTION',
    credentials = {},
    config = {},
  }) {
    // Lookup target Integration entity
    const integration = await defaultPrisma.integration.findUnique({
      where: { id: parseInt(integrationId, 10) },
    });

    if (!integration) {
      throw new Error(`Integration ID ${integrationId} not found.`);
    }

    const adapter = ConnectorProviderRegistry.getAdapter(integration.provider_code);
    if (!adapter) {
      throw new Error(`No adapter registered for provider code '${integration.provider_code}'.`);
    }

    const connIdentifier = `CONN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // Encrypt sensitive credentials (AES-256-GCM string: iv:tag:cipher)
    const secretKey = credentials.apiKey || credentials.secret || credentials.token || 'default_secret';
    const encryptedSecretStr = encryptSecret(secretKey);

    // Save IntegrationConnection
    const connection = await defaultPrisma.integrationConnection.create({
      data: {
        integration_id: integration.id,
        msme_id: parseInt(msmeId, 10),
        connection_identifier: connIdentifier,
        status: 'ACTIVE',
        health_status: 'HEALTHY',
        last_connected_at: new Date(),
        metadata: { name: name || `${integration.name} Connection`, environment },
      },
    });

    // Save IntegrationConfiguration & IntegrationSecret
    const configuration = await defaultPrisma.integrationConfiguration.create({
      data: {
        integration_id: integration.id,
        msme_id: parseInt(msmeId, 10),
        auth_type: credentials.authType || 'API_KEY',
        settings_json: config,
      },
    });

    await defaultPrisma.integrationSecret.create({
      data: {
        configuration_id: configuration.id,
        secret_key: 'PRIMARY_CREDENTIAL',
        encrypted_value: encryptedSecretStr,
      },
    });

    // Test connection via adapter
    const testResult = await adapter.testConnection(credentials);

    IntegrationLogger.logEvent('INFO', `Connector connection '${connIdentifier}' [ID: ${connection.id}] created for ${integration.provider_code}`, {
      connectionId: connection.id,
      providerCode: integration.provider_code,
      status: connection.status,
    });

    return {
      connection,
      testResult,
    };
  }

  /**
   * Test an existing connection health
   */
  async testConnectionHealth(connectionId) {
    const id = parseInt(connectionId, 10);
    if (isNaN(id)) {
      throw new Error(`Invalid connection ID: ${connectionId}`);
    }

    const connection = await defaultPrisma.integrationConnection.findUnique({
      where: { id },
      include: { integration: true },
    });

    if (!connection) {
      throw new Error(`Connection ID ${id} not found.`);
    }

    const adapter = ConnectorProviderRegistry.getAdapter(connection.integration.provider_code);
    if (!adapter) {
      throw new Error(`Adapter not found for provider '${connection.integration.provider_code}'.`);
    }

    const startTime = Date.now();
    const testResult = await adapter.testConnection({});
    const latencyMs = Date.now() - startTime;

    const newStatus = testResult.success ? 'ACTIVE' : 'DEGRADED';
    await defaultPrisma.integrationConnection.update({
      where: { id: connection.id },
      data: { status: newStatus, health_status: testResult.success ? 'HEALTHY' : 'UNHEALTHY', last_connected_at: new Date() },
    });

    return {
      connectionId: connection.id,
      status: newStatus,
      healthStatus: testResult.success ? 'HEALTHY' : 'UNHEALTHY',
      latencyMs,
      details: testResult,
    };
  }

  /**
   * Rotate connection credentials
   */
  async rotateCredentials(connectionId, newSecretKey) {
    const id = parseInt(connectionId, 10);
    if (isNaN(id)) {
      throw new Error(`Invalid connection ID: ${connectionId}`);
    }

    const connection = await defaultPrisma.integrationConnection.findUnique({
      where: { id },
    });

    if (!connection) {
      throw new Error(`Connection ID ${id} not found.`);
    }

    const encryptedSecretStr = encryptSecret(newSecretKey);

    const config = await defaultPrisma.integrationConfiguration.findFirst({
      where: { integration_id: connection.integration_id, msme_id: connection.msme_id },
    });

    if (config) {
      await defaultPrisma.integrationSecret.updateMany({
        where: { configuration_id: config.id, secret_key: 'PRIMARY_CREDENTIAL' },
        data: {
          encrypted_value: encryptedSecretStr,
        },
      });
    }

    IntegrationLogger.logEvent('INFO', `Credentials rotated for connection [ID: ${id}]`, { connectionId: id });
    return { success: true, message: 'Credentials updated successfully.' };
  }
}

module.exports = new ConnectionManager();
