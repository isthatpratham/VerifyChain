/**
 * DeveloperAppManagementService.js
 * Developer Application Lifecycle & Governance Service.
 * Supports creation, editing, deletion, enable/disable, API Key assignment,
 * scope management, usage statistics, lifecycle tracking, and audit history.
 */
const defaultPrisma = require('../../utils/prismaClient');
const { developerAppRepository } = require('../../repositories');
const ApiKeyManagementService = require('./ApiKeyManagementService');

class DeveloperAppManagementService {
  /**
   * Register a new Developer Application
   */
  async registerApp({ msmeId = 1, name, description, environment = 'SANDBOX' }) {
    const parsedMsmeId = parseInt(msmeId, 10);
    const appId = `APP-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const app = await developerAppRepository.create({
      msme_id: parsedMsmeId,
      app_id: appId,
      name,
      description: description || 'Enterprise application for API integrations',
      environment,
      is_active: true,
    });

    await defaultPrisma.integrationAuditLog.create({
      data: {
        actor_type: 'DEVELOPER',
        actor_id: `MSME_${parsedMsmeId}`,
        action: 'DEVELOPER_APP_REGISTERED',
        resource_type: 'DeveloperApplication',
        resource_id: String(app.id),
        changes_json: { name, environment, app_id: appId },
      },
    });

    return app;
  }

  /**
   * List Applications for an MSME (auto-bootstraps default app if empty)
   */
  async listApps(msmeId = 1) {
    const parsedMsmeId = parseInt(msmeId, 10);

    let apps = await defaultPrisma.developerApplication.findMany({
      where: { msme_id: parsedMsmeId },
      orderBy: { created_at: 'desc' },
      include: {
        api_keys: true,
        webhook_subscriptions: true,
      },
    });

    if (apps.length === 0) {
      await ApiKeyManagementService._getOrCreateDefaultApp(parsedMsmeId);
      apps = await defaultPrisma.developerApplication.findMany({
        where: { msme_id: parsedMsmeId },
        orderBy: { created_at: 'desc' },
        include: {
          api_keys: true,
          webhook_subscriptions: true,
        },
      });
    }

    return apps.map((app) => ({
      ...app,
      activeKeysCount: app.api_keys?.filter((k) => k.status === 'ACTIVE').length || 0,
      activeWebhooksCount: app.webhook_subscriptions?.filter((w) => w.is_active).length || 0,
    }));
  }

  /**
   * Get full details of an application including API keys, webhooks, & audit history
   */
  async getAppDetails(id) {
    const appId = parseInt(id, 10);
    const app = await defaultPrisma.developerApplication.findUnique({
      where: { id: appId },
      include: {
        api_keys: {
          orderBy: { created_at: 'desc' },
        },
        webhook_subscriptions: {
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!app) throw new Error(`Developer Application ID ${appId} not found.`);

    // Fetch audit history for this app
    const auditLogs = await defaultPrisma.integrationAuditLog.findMany({
      where: {
        resource_type: { in: ['DeveloperApplication', 'ApiKey', 'WebhookSubscription'] },
        resource_id: String(appId),
      },
      take: 20,
      orderBy: { created_at: 'desc' },
    });

    return {
      app: {
        ...app,
        api_keys: app.api_keys.map((k) => ({
          ...k,
          key_hash: undefined,
          displayKey: `${k.key_prefix}••••••••••••`,
        })),
      },
      auditLogs,
    };
  }

  /**
   * Update Application details
   */
  async updateApp(id, data) {
    const appId = parseInt(id, 10);
    const existing = await defaultPrisma.developerApplication.findUnique({ where: { id: appId } });
    if (!existing) throw new Error(`Developer Application ID ${appId} not found.`);

    const updateData = {};
    if (data.name) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.environment) updateData.environment = data.environment;
    if (typeof data.is_active === 'boolean') updateData.is_active = data.is_active;

    const updated = await developerAppRepository.update(appId, updateData);

    await defaultPrisma.integrationAuditLog.create({
      data: {
        actor_type: 'DEVELOPER',
        actor_id: `MSME_${existing.msme_id}`,
        action: 'DEVELOPER_APP_UPDATED',
        resource_type: 'DeveloperApplication',
        resource_id: String(appId),
        changes_json: updateData,
      },
    });

    return updated;
  }

  /**
   * Toggle application enable/disable status
   */
  async toggleActive(id) {
    const appId = parseInt(id, 10);
    const app = await developerAppRepository.findById(appId);
    if (!app) throw new Error(`App ID ${appId} not found.`);

    const nextState = !app.is_active;
    const updated = await developerAppRepository.update(appId, { is_active: nextState });

    await defaultPrisma.integrationAuditLog.create({
      data: {
        actor_type: 'DEVELOPER',
        actor_id: `MSME_${app.msme_id}`,
        action: nextState ? 'DEVELOPER_APP_ENABLED' : 'DEVELOPER_APP_DISABLED',
        resource_type: 'DeveloperApplication',
        resource_id: String(appId),
        changes_json: { is_active: nextState },
      },
    });

    return updated;
  }

  /**
   * Directly assign a new API Key to an application
   */
  async assignApiKey(appId, { name, environment, scopes, expiresDays }) {
    const id = parseInt(appId, 10);
    const app = await defaultPrisma.developerApplication.findUnique({ where: { id } });
    if (!app) throw new Error(`Developer Application ID ${id} not found.`);

    return ApiKeyManagementService.createApiKey({
      developerAppId: id,
      msmeId: app.msme_id,
      name: name || `${app.name} API Key`,
      environment: environment || app.environment,
      scopes,
      expiresDays,
    });
  }

  /**
   * Delete Application permanently
   */
  async deleteApp(id) {
    const appId = parseInt(id, 10);
    const app = await defaultPrisma.developerApplication.findUnique({
      where: { id: appId },
      include: { api_keys: true, webhook_subscriptions: true },
    });

    if (!app) throw new Error(`App ID ${appId} not found.`);

    // Cascade delete usage logs, api keys, and webhooks
    const keyIds = app.api_keys.map((k) => k.id);
    if (keyIds.length > 0) {
      await defaultPrisma.apiKeyUsage.deleteMany({ where: { api_key_id: { in: keyIds } } });
      await defaultPrisma.apiKey.deleteMany({ where: { developer_app_id: appId } });
    }

    const subIds = app.webhook_subscriptions.map((w) => w.id);
    if (subIds.length > 0) {
      const deliveries = await defaultPrisma.webhookDelivery.findMany({ where: { subscription_id: { in: subIds } }, select: { id: true } });
      const delIds = deliveries.map((d) => d.id);
      if (delIds.length > 0) {
        await defaultPrisma.webhookAttempt.deleteMany({ where: { delivery_id: { in: delIds } } });
        await defaultPrisma.webhookDelivery.deleteMany({ where: { subscription_id: { in: subIds } } });
      }
      await defaultPrisma.webhookSubscription.deleteMany({ where: { developer_app_id: appId } });
    }

    await defaultPrisma.developerApplication.delete({ where: { id: appId } });

    await defaultPrisma.integrationAuditLog.create({
      data: {
        actor_type: 'DEVELOPER',
        actor_id: `MSME_${app.msme_id}`,
        action: 'DEVELOPER_APP_DELETED',
        resource_type: 'DeveloperApplication',
        resource_id: String(appId),
        changes_json: { name: app.name, app_id: app.app_id },
      },
    });

    return { success: true, message: `Developer Application '${app.name}' deleted.` };
  }
}

module.exports = new DeveloperAppManagementService();
