/**
 * ConnectorHealthMonitor.js
 * Connector Health Monitoring and Telemetry Engine.
 * Tracks availability, latency, sync metrics, and error rates across all integration connections.
 */
const ConnectorProviderRegistry = require('../registry/ConnectorProviderRegistry');
const defaultPrisma = require('../../utils/prismaClient');

class ConnectorHealthMonitor {
  /**
   * Run health check across all active integration connections
   */
  async checkAllConnectionsHealth() {
    const connections = await defaultPrisma.integrationConnection.findMany({
      include: { integration: true },
    });

    const results = [];

    for (const conn of connections) {
      const adapter = ConnectorProviderRegistry.getAdapter(conn.integration.provider_code);
      const startTime = Date.now();

      if (!adapter) {
        results.push({
          connectionId: conn.id,
          name: conn.name,
          providerCode: conn.integration.provider_code,
          status: 'UNHEALTHY',
          error: 'Adapter not found',
          latencyMs: 0,
        });
        continue;
      }

      try {
        const health = await adapter.healthCheck();
        results.push({
          connectionId: conn.id,
          name: conn.name,
          providerCode: conn.integration.provider_code,
          status: health.status,
          latencyMs: health.latencyMs,
          lastCheckAt: new Date().toISOString(),
        });
      } catch (err) {
        results.push({
          connectionId: conn.id,
          name: conn.name,
          providerCode: conn.integration.provider_code,
          status: 'UNHEALTHY',
          error: err.message,
          latencyMs: Date.now() - startTime,
        });
      }
    }

    return {
      totalConnections: connections.length,
      healthyCount: results.filter((r) => r.status === 'HEALTHY').length,
      unhealthyCount: results.filter((r) => r.status !== 'HEALTHY').length,
      connections: results,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = new ConnectorHealthMonitor();
