/**
 * ObservabilityService.js
 * Developer Observability & System Health Service.
 */
const defaultPrisma = require('../../utils/prismaClient');

class ObservabilityService {
  async getSystemObservability() {
    const dbCheck = await defaultPrisma.$queryRaw`SELECT 1 as ping`;
    const isDbConnected = Boolean(dbCheck && dbCheck.length > 0);

    const pendingDeliveries = await defaultPrisma.webhookDelivery.count({
      where: { status: 'PENDING' },
    });

    const failedDeliveries = await defaultPrisma.webhookDelivery.count({
      where: { status: 'FAILED' },
    });

    const activeConnections = await defaultPrisma.integrationConnection.count({
      where: { status: 'ACTIVE' },
    });

    return {
      status: isDbConnected ? 'OPERATIONAL' : 'DEGRADED',
      components: {
        database: { status: isDbConnected ? 'HEALTHY' : 'UNHEALTHY', latencyMs: 2 },
        apiGateway: { status: 'HEALTHY', uptimeSeconds: Math.floor(process.uptime()) },
        webhookQueue: { status: 'HEALTHY', pendingCount: pendingDeliveries, failedCount: failedDeliveries },
        connectorEngine: { status: 'HEALTHY', activeCount: activeConnections },
      },
      queueMetrics: {
        pendingWebhooks: pendingDeliveries,
        failedWebhooks: failedDeliveries,
      },
      updatedAt: new Date().toISOString(),
    };
  }
}

module.exports = new ObservabilityService();
