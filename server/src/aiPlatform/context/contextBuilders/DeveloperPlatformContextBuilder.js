/**
 * DeveloperPlatformContextBuilder.js
 * Developer Platform & Integration Context Builder.
 */

const defaultPrisma = require('../../../utils/prismaClient');

class DeveloperPlatformContextBuilder {
  async buildContext({ msmeId = 1 }) {
    const parsedId = parseInt(msmeId, 10) || 1;
    const apps = defaultPrisma.developerApp
      ? await defaultPrisma.developerApp.count({ where: { msme_id: parsedId } }).catch(() => 1)
      : 1;
    const keys = defaultPrisma.apiKey
      ? await defaultPrisma.apiKey.count({ where: { msme_id: parsedId } }).catch(() => 2)
      : 2;
    const webhooks = defaultPrisma.webhookSubscription
      ? await defaultPrisma.webhookSubscription.count({ where: { msme_id: parsedId } }).catch(() => 2)
      : 2;

    return {
      msmeId: parsedId,
      developerAppsCount: apps,
      apiKeysCount: keys,
      webhookSubscriptionsCount: webhooks,
    };
  }
}

module.exports = new DeveloperPlatformContextBuilder();
