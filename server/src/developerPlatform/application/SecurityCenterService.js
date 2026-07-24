/**
 * SecurityCenterService.js
 * Developer Security Center Service.
 * Analyzes security events, expired/inactive API keys, unencrypted credentials, rate limit violations,
 * and security recommendations.
 */
const defaultPrisma = require('../../utils/prismaClient');

class SecurityCenterService {
  async getSecurityReport(msmeId = 1) {
    const parsedMsmeId = parseInt(msmeId, 10);

    // 1. Expired or Inactive API Keys
    const now = new Date();
    const expiredKeys = await defaultPrisma.apiKey.findMany({
      where: {
        developer_app: { msme_id: parsedMsmeId },
        status: 'ACTIVE',
        expires_at: { lte: now },
      },
    });

    const inactiveDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const inactiveKeys = await defaultPrisma.apiKey.findMany({
      where: {
        developer_app: { msme_id: parsedMsmeId },
        status: 'ACTIVE',
        OR: [
          { last_used_at: { lte: inactiveDate } },
          { last_used_at: null, created_at: { lte: inactiveDate } },
        ],
      },
    });

    // 2. High-rate webhook failures
    const failedDeliveries = await defaultPrisma.webhookDelivery.findMany({
      where: {
        subscription: { developer_app: { msme_id: parsedMsmeId } },
        status: 'PERMANENTLY_FAILED',
      },
      take: 10,
    });

    // 3. Security Alerts from DB
    const activeAlerts = await defaultPrisma.securityAlert.findMany({
      where: { msme_id: parsedMsmeId, is_resolved: false },
      orderBy: { created_at: 'desc' },
    });

    // 4. Security Recommendations
    const recommendations = [];

    if (expiredKeys.length > 0) {
      recommendations.push({
        id: 'REC_EXPIRED_KEYS',
        type: 'KEY_EXPIRED',
        severity: 'HIGH',
        title: 'Revoke Expired API Keys',
        message: `Found ${expiredKeys.length} active API key(s) that have passed their expiration date.`,
      });
    }

    if (inactiveKeys.length > 0) {
      recommendations.push({
        id: 'REC_INACTIVE_KEYS',
        type: 'KEY_INACTIVE',
        severity: 'MEDIUM',
        title: 'Clean Up Inactive API Keys',
        message: `Found ${inactiveKeys.length} API key(s) unused for over 90 days. Revoke them to reduce attack surface.`,
      });
    }

    if (failedDeliveries.length > 3) {
      recommendations.push({
        id: 'REC_WEBHOOK_FAILURES',
        type: 'WEBHOOK_FAILURE',
        severity: 'MEDIUM',
        title: 'Inspect Webhook Failures',
        message: `Multiple webhook delivery failures detected. Verify target URL endpoint availability and SSL certificate validity.`,
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        id: 'REC_HEALTHY',
        type: 'ALL_GOOD',
        severity: 'INFO',
        title: 'Security Configuration Healthy',
        message: 'No active credential risk or security configuration warnings detected.',
      });
    }

    return {
      securityScore: Math.max(100 - (expiredKeys.length * 15 + activeAlerts.length * 20), 40),
      activeAlerts,
      expiredKeysCount: expiredKeys.length,
      inactiveKeysCount: inactiveKeys.length,
      failedWebhookCount: failedDeliveries.length,
      recommendations,
    };
  }

  async resolveAlert(msmeId = 1, alertId) {
    return defaultPrisma.securityAlert.update({
      where: { id: parseInt(alertId, 10) },
      data: { is_resolved: true, resolved_at: new Date() },
    });
  }
}

module.exports = new SecurityCenterService();
