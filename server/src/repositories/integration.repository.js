const BaseRepository = require('./base.repository');

class IntegrationRepository extends BaseRepository {
  constructor() {
    super('integration');
  }

  async findByIntegrationId(integrationId, client) {
    return this.findUnique({ integration_id: integrationId }, {}, client);
  }

  async findByProviderCode(providerCode, client) {
    return this.findFirst({ provider_code: providerCode }, {}, client);
  }
}

module.exports = new IntegrationRepository();
