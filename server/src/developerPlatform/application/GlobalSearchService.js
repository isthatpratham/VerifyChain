/**
 * GlobalSearchService.js
 * Universal Global Search Engine across Developer Platform Entities.
 */
const defaultPrisma = require('../../utils/prismaClient');

class GlobalSearchService {
  async universalSearch(msmeId = 1, query = '') {
    if (!query || query.trim().length === 0) {
      return { query: '', results: [] };
    }

    const q = query.trim().toLowerCase();
    const parsedMsmeId = parseInt(msmeId, 10);

    const results = [];

    // 1. Search Developer Applications
    const apps = await defaultPrisma.developerApplication.findMany({
      where: { msme_id: parsedMsmeId },
    });
    apps.forEach((app) => {
      if (app.name.toLowerCase().includes(q) || app.app_id.toLowerCase().includes(q)) {
        results.push({
          type: 'APPLICATION',
          id: app.id,
          title: app.name,
          subtitle: `App ID: ${app.app_id} • ${app.environment}`,
          link: '/developer?tab=apps',
        });
      }
    });

    // 2. Search API Keys
    const apiKeys = await defaultPrisma.apiKey.findMany({
      where: { developer_app: { msme_id: parsedMsmeId } },
    });
    apiKeys.forEach((key) => {
      if (key.name.toLowerCase().includes(q) || key.key_prefix.toLowerCase().includes(q)) {
        results.push({
          type: 'API_KEY',
          id: key.id,
          title: key.name,
          subtitle: `Prefix: ${key.key_prefix} • Status: ${key.status}`,
          link: '/developer?tab=apikeys',
        });
      }
    });

    // 3. Search Webhooks
    const webhooks = await defaultPrisma.webhookSubscription.findMany({
      where: { developer_app: { msme_id: parsedMsmeId } },
    });
    webhooks.forEach((wh) => {
      if (wh.target_url.toLowerCase().includes(q) || wh.subscription_id.toLowerCase().includes(q)) {
        results.push({
          type: 'WEBHOOK',
          id: wh.id,
          title: wh.subscription_id,
          subtitle: wh.target_url,
          link: '/developer?tab=webhooks',
        });
      }
    });

    // 4. Search Connectors
    const connections = await defaultPrisma.integrationConnection.findMany({
      where: { msme_id: parsedMsmeId },
      include: { integration: true },
    });
    connections.forEach((conn) => {
      if (conn.connection_identifier.toLowerCase().includes(q) || conn.integration?.name?.toLowerCase().includes(q)) {
        results.push({
          type: 'CONNECTOR',
          id: conn.id,
          title: conn.integration?.name || 'Connector',
          subtitle: `ID: ${conn.connection_identifier} • Health: ${conn.health_status}`,
          link: '/developer?tab=connectors',
        });
      }
    });

    // 5. Search Audit Logs
    const auditLogs = await defaultPrisma.integrationAuditLog.findMany({
      take: 20,
      orderBy: { created_at: 'desc' },
    });
    auditLogs.forEach((log) => {
      if (log.action.toLowerCase().includes(q) || log.resource_type.toLowerCase().includes(q)) {
        results.push({
          type: 'AUDIT_LOG',
          id: log.id,
          title: `${log.action} on ${log.resource_type}`,
          subtitle: `Actor: ${log.actor_id} • ${new Date(log.created_at).toLocaleString()}`,
          link: '/developer?tab=audit',
        });
      }
    });

    return {
      query: q,
      totalResults: results.length,
      results: results.slice(0, 25),
    };
  }
}

module.exports = new GlobalSearchService();
