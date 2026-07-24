/**
 * DeveloperDashboardService.js
 * Aggregates high-level Developer Workspace analytics, active apps, key statistics,
 * connector health, webhook status, and security alerts for the Developer Dashboard overview.
 */
const defaultPrisma = require('../../utils/prismaClient');

class DeveloperDashboardService {
  async getDashboardOverview(msmeId = 1) {
    const parsedMsmeId = parseInt(msmeId, 10);

    // 1. Applications & API Keys Count
    const appsCount = await defaultPrisma.developerApplication.count({
      where: { msme_id: parsedMsmeId, is_active: true },
    });

    const activeKeysCount = await defaultPrisma.apiKey.count({
      where: {
        developer_app: { msme_id: parsedMsmeId },
        status: 'ACTIVE',
      },
    });

    // 2. Active Webhook Subscriptions
    const activeWebhooksCount = await defaultPrisma.webhookSubscription.count({
      where: {
        developer_app: { msme_id: parsedMsmeId },
        is_active: true,
      },
    });

    // 3. Active Connections & Health
    const connections = await defaultPrisma.integrationConnection.findMany({
      where: { msme_id: parsedMsmeId },
      include: { integration: true },
    });

    const healthyConnections = connections.filter(c => c.health_status === 'HEALTHY').length;

    // 4. API Request Volume (Last 24 Hours)
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const usageLogs24h = await defaultPrisma.apiKeyUsage.findMany({
      where: {
        api_key: { developer_app: { msme_id: parsedMsmeId } },
        created_at: { gte: last24h },
      },
      select: { status_code: true, response_time_ms: true },
    });

    const totalRequests24h = usageLogs24h.length;
    const successfulRequests24h = usageLogs24h.filter(u => u.status_code >= 200 && u.status_code < 400).length;
    const successRate24h = totalRequests24h > 0 ? ((successfulRequests24h / totalRequests24h) * 100).toFixed(1) : 100.0;
    const avgLatencyMs24h = totalRequests24h > 0 ? Math.round(usageLogs24h.reduce((acc, u) => acc + u.response_time_ms, 0) / totalRequests24h) : 12;

    // 5. Unresolved Security Alerts
    const securityAlertsCount = await defaultPrisma.securityAlert.count({
      where: { msme_id: parsedMsmeId, is_resolved: false },
    });

    // 6. Recent Audit Events
    const recentAuditLogs = await defaultPrisma.integrationAuditLog.findMany({
      take: 6,
      orderBy: { created_at: 'desc' },
    });

    // 7. Recent Connected Applications
    const recentApps = await defaultPrisma.developerApplication.findMany({
      where: { msme_id: parsedMsmeId },
      take: 5,
      orderBy: { created_at: 'desc' },
      include: { _count: { select: { api_keys: true, webhook_subscriptions: true } } },
    });

    return {
      metrics: {
        totalApplications: appsCount,
        activeApiKeys: activeKeysCount,
        activeWebhooks: activeWebhooksCount,
        totalConnections: connections.length,
        healthyConnections,
        totalRequests24h,
        successRate24h: Number(successRate24h),
        avgLatencyMs24h,
        unresolvedSecurityAlerts: securityAlertsCount,
      },
      recentApplications: recentApps,
      recentAuditLogs,
      quickActions: [
        { label: 'Create API Key', action: 'CREATE_API_KEY', path: '/developer?tab=apikeys' },
        { label: 'Register Application', action: 'CREATE_APP', path: '/developer?tab=apps' },
        { label: 'Add Webhook Endpoint', action: 'CREATE_WEBHOOK', path: '/developer?tab=webhooks' },
        { label: 'Connect Integration', action: 'CONNECT_ADAPTER', path: '/developer?tab=connectors' },
      ],
    };
  }
}

module.exports = new DeveloperDashboardService();
