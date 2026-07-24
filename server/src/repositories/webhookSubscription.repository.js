const BaseRepository = require('./base.repository');

class WebhookSubscriptionRepository extends BaseRepository {
  constructor() {
    super('webhookSubscription');
  }

  async findBySubscriptionId(subscriptionId, client) {
    return this.findUnique({ subscription_id: subscriptionId }, {}, client);
  }

  async findByDeveloperAppId(developerAppId, client) {
    return this.findMany({ where: { developer_app_id: developerAppId }, orderBy: { created_at: 'desc' } }, client);
  }
}

module.exports = new WebhookSubscriptionRepository();
