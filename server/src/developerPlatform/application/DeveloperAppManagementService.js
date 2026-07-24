/**
 * DeveloperAppManagementService.js
 * Developer Application Lifecycle Service.
 */
const defaultPrisma = require('../../utils/prismaClient');
const { developerAppRepository } = require('../../repositories');

class DeveloperAppManagementService {
  async registerApp({ msmeId = 1, name, description, environment = 'SANDBOX' }) {
    const appId = `APP-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const app = await developerAppRepository.create({
      msme_id: parseInt(msmeId, 10),
      app_id: appId,
      name,
      description,
      environment,
      is_active: true,
    });

    await defaultPrisma.integrationAuditLog.create({
      data: {
        actor_type: 'DEVELOPER',
        actor_id: `MSME_${msmeId}`,
        action: 'DEVELOPER_APP_REGISTERED',
        resource_type: 'DeveloperApplication',
        resource_id: String(app.id),
        changes_json: { name, environment },
      },
    });

    return app;
  }

  async listApps(msmeId = 1) {
    const parsedMsmeId = parseInt(msmeId, 10);
    return defaultPrisma.developerApplication.findMany({
      where: { msme_id: parsedMsmeId },
      orderBy: { created_at: 'desc' },
      include: {
        api_keys: true,
        webhook_subscriptions: true,
      },
    });
  }

  async updateApp(id, data) {
    const appId = parseInt(id, 10);
    return developerAppRepository.update(appId, data);
  }

  async toggleActive(id) {
    const appId = parseInt(id, 10);
    const app = await developerAppRepository.findById(appId);
    if (!app) throw new Error(`App ID ${appId} not found.`);

    return developerAppRepository.update(appId, { is_active: !app.is_active });
  }
}

module.exports = new DeveloperAppManagementService();
