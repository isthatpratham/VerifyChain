/**
 * ApiKeyManagementService.js
 * Enterprise API Key Lifecycle Management Service.
 * Manages creation (showing raw key ONCE), view, rotation, revocation, status toggle,
 * deletion, scope assignments, environment isolation, and usage statistics.
 */
const defaultPrisma = require('../../utils/prismaClient');
const { ApiKeyManager, ALL_VALID_SCOPES } = require('../../integrationPlatform');

class ApiKeyManagementService {
  /**
   * Helper to ensure a developer app exists for an MSME
   */
  async _getOrCreateDefaultApp(msmeId) {
    const parsedMsmeId = parseInt(msmeId || 1, 10);
    let app = await defaultPrisma.developerApplication.findFirst({
      where: { msme_id: parsedMsmeId },
      orderBy: { created_at: 'asc' },
    });

    if (!app) {
      app = await defaultPrisma.developerApplication.create({
        data: {
          msme_id: parsedMsmeId,
          app_id: `APP-DEFAULT-${Date.now()}`,
          name: 'Default Enterprise App',
          description: 'Auto-created default application for API integrations',
          environment: 'PRODUCTION',
          is_active: true,
        },
      });
    }

    return app;
  }

  /**
   * Create a new API Key (returns raw Key ONCE)
   */
  async createApiKey({ developerAppId, msmeId = 1, name, environment = 'PRODUCTION', scopes = ALL_VALID_SCOPES, expiresDays = null }) {
    let appId;

    if (developerAppId) {
      appId = parseInt(developerAppId, 10);
      const app = await defaultPrisma.developerApplication.findUnique({ where: { id: appId } });
      if (!app) {
        const defaultApp = await this._getOrCreateDefaultApp(msmeId);
        appId = defaultApp.id;
      }
    } else {
      const defaultApp = await this._getOrCreateDefaultApp(msmeId);
      appId = defaultApp.id;
    }

    const keyPair = ApiKeyManager.generateKeyPair(environment);

    let expiresAt = null;
    if (expiresDays && parseInt(expiresDays, 10) > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiresDays, 10));
    }

    const apiKeyRecord = await defaultPrisma.apiKey.create({
      data: {
        developer_app_id: appId,
        key_prefix: keyPair.keyPrefix,
        key_hash: keyPair.keyHash,
        name: name || `API Key ${keyPair.keyPrefix}`,
        environment,
        scopes: Array.isArray(scopes) && scopes.length > 0 ? scopes : ALL_VALID_SCOPES,
        status: 'ACTIVE',
        expires_at: expiresAt,
      },
    });

    // Audit log
    await defaultPrisma.integrationAuditLog.create({
      data: {
        actor_type: 'DEVELOPER',
        actor_id: `MSME_${msmeId}`,
        action: 'API_KEY_CREATED',
        resource_type: 'ApiKey',
        resource_id: String(apiKeyRecord.id),
        changes_json: { name: apiKeyRecord.name, environment, scopes: apiKeyRecord.scopes, expires_at: expiresAt },
      },
    });

    return {
      apiKey: {
        ...apiKeyRecord,
        key_hash: undefined,
        displayKey: `${apiKeyRecord.key_prefix}••••••••••••`,
      },
      rawKey: keyPair.rawKey, // RETURNED ONLY ONCE
    };
  }

  /**
   * List API Keys for a Developer App or MSME Profile
   */
  async listApiKeys({ developerAppId, msmeId = 1 } = {}) {
    let whereClause = {};

    if (developerAppId) {
      whereClause.developer_app_id = parseInt(developerAppId, 10);
    } else {
      const app = await this._getOrCreateDefaultApp(msmeId);
      whereClause.developer_app_id = app.id;
    }

    const keys = await defaultPrisma.apiKey.findMany({
      where: whereClause,
      orderBy: { created_at: 'desc' },
      include: {
        _count: { select: { usage_logs: true } },
      },
    });

    return keys.map((k) => ({
      ...k,
      key_hash: undefined, // NEVER EXPOSE STORED SECRET HASH
      displayKey: `${k.key_prefix}••••••••••••`,
      totalUsageCount: k._count?.usage_logs || 0,
      isExpired: k.expires_at ? new Date(k.expires_at) < new Date() : false,
    }));
  }

  /**
   * Update API Key properties (status, name, scopes, expiration)
   */
  async updateApiKey(apiKeyId, { name, status, scopes, expiresDays }) {
    const id = parseInt(apiKeyId, 10);
    const existing = await defaultPrisma.apiKey.findUnique({ where: { id } });
    if (!existing) {
      throw new Error(`API Key ID ${id} not found.`);
    }

    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (status !== undefined && ['ACTIVE', 'DISABLED', 'REVOKED'].includes(status)) {
      updateData.status = status;
      if (status === 'REVOKED') {
        updateData.revoked_at = new Date();
      }
    }
    if (Array.isArray(scopes)) updateData.scopes = scopes;

    if (expiresDays !== undefined) {
      if (expiresDays === null || parseInt(expiresDays, 10) === 0) {
        updateData.expires_at = null;
      } else {
        const exp = new Date();
        exp.setDate(exp.getDate() + parseInt(expiresDays, 10));
        updateData.expires_at = exp;
      }
    }

    const updated = await defaultPrisma.apiKey.update({
      where: { id },
      data: updateData,
    });

    await defaultPrisma.integrationAuditLog.create({
      data: {
        actor_type: 'DEVELOPER',
        actor_id: `APP_${existing.developer_app_id}`,
        action: 'API_KEY_UPDATED',
        resource_type: 'ApiKey',
        resource_id: String(id),
        changes_json: updateData,
      },
    });

    return {
      ...updated,
      key_hash: undefined,
      displayKey: `${updated.key_prefix}••••••••••••`,
    };
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
  async revokeApiKey(apiKeyId, reason = 'Revoked by developer') {
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
        actor_id: `APP_${updated.developer_app_id}`,
        action: 'API_KEY_REVOKED',
        resource_type: 'ApiKey',
        resource_id: String(id),
        changes_json: { reason },
      },
    });

    return {
      ...updated,
      key_hash: undefined,
      displayKey: `${updated.key_prefix}••••••••••••`,
    };
  }

  /**
   * Delete an API key permanently
   */
  async deleteApiKey(apiKeyId) {
    const id = parseInt(apiKeyId, 10);
    const existing = await defaultPrisma.apiKey.findUnique({ where: { id } });
    if (!existing) {
      throw new Error(`API Key ID ${id} not found.`);
    }

    // Delete usage logs first due to foreign key constraints
    await defaultPrisma.apiKeyUsage.deleteMany({ where: { api_key_id: id } });

    await defaultPrisma.apiKey.delete({ where: { id } });

    await defaultPrisma.integrationAuditLog.create({
      data: {
        actor_type: 'DEVELOPER',
        actor_id: `APP_${existing.developer_app_id}`,
        action: 'API_KEY_DELETED',
        resource_type: 'ApiKey',
        resource_id: String(id),
        changes_json: { key_prefix: existing.key_prefix, name: existing.name },
      },
    });

    return { success: true, message: `API Key ID ${id} deleted successfully.` };
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
