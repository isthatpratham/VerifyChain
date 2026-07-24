/**
 * ApiKeyManagementService.js
 * Enterprise API Key Lifecycle Management Service.
 * Manages creation (showing raw key ONCE), view, rotation, revocation, expiration,
 * scope assignments, environment isolation, and usage statistics.
 */
const defaultPrisma = require('../../utils/prismaClient');
const { ApiKeyManager, ALL_VALID_SCOPES } = require('../../integrationPlatform');

class ApiKeyManagementService {
  /**
   * Create a new API Key (returns raw Key ONCE)
   */
  async createApiKey({ developerAppId, name, environment = 'PRODUCTION', scopes = ALL_VALID_SCOPES, expiresDays = null }) {
    const appId = parseInt(developerAppId, 10);
    const app = await defaultPrisma.developerApplication.findUnique({ where: { id: appId } });
    if (!app) {
      throw new Error(`Developer Application ID ${appId} not found.`);
    }

    const keyPair = ApiKeyManager.generateKeyPair(environment);

    let expiresAt = null;
    if (expiresDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiresDays, 10));
    }

    const apiKeyRecord = await defaultPrisma.apiKey.create({
      data: {
        developer_app_id: appId,
        key_prefix: keyPair.keyPrefix,
        key_hash: keyPair.keyHash,
        name: name || `${app.name} Key`,
        environment,
        scopes: scopes || [],
        status: 'ACTIVE',
        expires_at: expiresAt,
      },
    });

    // Record audit log
    await defaultPrisma.integrationAuditLog.create({
      data: {
        actor_type: 'DEVELOPER',
        actor_id: `APP_${appId}`,
        action: 'API_KEY_CREATED',
        resource_type: 'ApiKey',
        resource_id: String(apiKeyRecord.id),
        changes_json: { name: apiKeyRecord.name, environment, scopes: apiKeyRecord.scopes },
      },
    });

    return {
      apiKey: apiKeyRecord,
      rawKey: keyPair.rawKey, // RETURNED ONLY ONCE
    };
  }

  /**
   * List API Keys for a Developer App or MSME Profile
   */
  async listApiKeys(developerAppId) {
    const appId = parseInt(developerAppId, 10);
    const keys = await defaultPrisma.apiKey.findMany({
      where: { developer_app_id: appId },
      orderBy: { created_at: 'desc' },
      include: {
        _count: { select: { usage_logs: true } },
      },
    });

    return keys.map((k) => ({
      ...k,
      key_hash: undefined, // NEVER EXPOSE STORED SECRET HASH
      displayKey: `${k.key_prefix}••••••••••••`,
    }));
  }

  /**
   * Rotate an API key (revokes old key and creates new key)
   */
  async rotateApiKey(apiKeyId) {
    const id = parseInt(apiKeyId, 10);
    const existingKey = await defaultPrisma.apiKey.findUnique({ where: { id } });
    if (!existingKey) {
      throw new Error(`API Key ID ${id} not found.`);
    }

    // Revoke old key
    await defaultPrisma.apiKey.update({
      where: { id },
      data: {
        status: 'REVOKED',
        revoked_at: new Date(),
        revocation_reason: 'Key rotated by developer',
      },
    });

    // Generate new key with same configuration
    return this.createApiKey({
      developerAppId: existingKey.developer_app_id,
      name: `${existingKey.name} (Rotated)`,
      environment: existingKey.environment,
      scopes: existingKey.scopes,
    });
  }

  /**
   * Revoke an API key
   */
  async revokeApiKey(apiKeyId, reason = 'Revoked by admin') {
    const id = parseInt(apiKeyId, 10);
    const updated = await defaultPrisma.apiKey.update({
      where: { id },
      data: {
        status: 'REVOKED',
        revoked_at: new Date(),
        revocation_reason: reason,
      },
    });

    await defaultPrisma.integrationAuditLog.create({
      data: {
        actor_type: 'DEVELOPER',
        actor_id: 'SYSTEM',
        action: 'API_KEY_REVOKED',
        resource_type: 'ApiKey',
        resource_id: String(id),
        changes_json: { reason },
      },
    });

    return updated;
  }

  /**
   * Get usage statistics for a specific API Key
   */
  async getKeyUsageStats(apiKeyId) {
    const id = parseInt(apiKeyId, 10);
    const logs = await defaultPrisma.apiKeyUsage.findMany({
      where: { api_key_id: id },
      take: 100,
      orderBy: { created_at: 'desc' },
    });

    const totalRequests = logs.length;
    const errorCount = logs.filter(l => l.status_code >= 400).length;
    const avgLatency = totalRequests > 0 ? Math.round(logs.reduce((a, b) => a + b.response_time_ms, 0) / totalRequests) : 0;

    return {
      apiKeyId: id,
      totalRequests,
      errorCount,
      avgLatencyMs: avgLatency,
      recentLogs: logs,
    };
  }
}

module.exports = new ApiKeyManagementService();
