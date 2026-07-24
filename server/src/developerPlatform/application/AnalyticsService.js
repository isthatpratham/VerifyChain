/**
 * AnalyticsService.js
 * Visual API Usage Analytics & Operational Intelligence Dataset Generator.
 */
const defaultPrisma = require('../../utils/prismaClient');

class AnalyticsService {
  async getUsageAnalytics(msmeId = 1, days = 7) {
    const parsedMsmeId = parseInt(msmeId, 10);
    const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Fetch API Key usage logs
    const logs = await defaultPrisma.apiKeyUsage.findMany({
      where: {
        api_key: { developer_app: { msme_id: parsedMsmeId } },
        created_at: { gte: sinceDate },
      },
      include: {
        api_key: { include: { developer_app: true } },
      },
      orderBy: { created_at: 'asc' },
    });

    // 1. Group by endpoint
    const endpointCounts = {};
    const appConsumerCounts = {};

    let totalRequests = logs.length;
    let successCount = 0;
    let failureCount = 0;
    let totalLatency = 0;

    logs.forEach((log) => {
      // Endpoint stats
      const epKey = `${log.http_method} ${log.endpoint}`;
      endpointCounts[epKey] = (endpointCounts[epKey] || 0) + 1;

      // App Consumer stats
      const appName = log.api_key?.developer_app?.name || 'Unknown Application';
      appConsumerCounts[appName] = (appConsumerCounts[appName] || 0) + 1;

      if (log.status_code >= 200 && log.status_code < 400) {
        successCount++;
      } else {
        failureCount++;
      }
      totalLatency += log.response_time_ms;
    });

    const topEndpoints = Object.entries(endpointCounts)
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topConsumers = Object.entries(appConsumerCounts)
      .map(([app, count]) => ({ app, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const avgLatencyMs = totalRequests > 0 ? Math.round(totalLatency / totalRequests) : 15;
    const successRate = totalRequests > 0 ? Number(((successCount / totalRequests) * 100).toFixed(1)) : 100.0;

    // Webhook volume
    const webhookDeliveriesCount = await defaultPrisma.webhookDelivery.count({
      where: {
        subscription: { developer_app: { msme_id: parsedMsmeId } },
        created_at: { gte: sinceDate },
      },
    });

    // Generate daily time series trend
    const dailyTrend = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const dayLogs = logs.filter(l => l.created_at.toISOString().startsWith(dateStr));
      dailyTrend.push({
        date: dateStr,
        requests: dayLogs.length,
        errors: dayLogs.filter(l => l.status_code >= 400).length,
      });
    }

    return {
      timeframeDays: days,
      summary: {
        totalRequests,
        successCount,
        failureCount,
        successRate,
        avgLatencyMs,
        webhookVolume: webhookDeliveriesCount,
      },
      topEndpoints,
      topConsumers,
      dailyTrend,
    };
  }
}

module.exports = new AnalyticsService();
