const BaseRepository = require('./base.repository');

class IntegrationConfigRepository extends BaseRepository {
  constructor() {
    super('integrationConfiguration');
  }

  async findByIntegrationId(integrationId, client) {
    return this.findFirst({ integration_id: integrationId }, {}, client);
  }

  async findByMsmeAndIntegration(msmeId, integrationId, client) {
    return this.findFirst({ msme_id: msmeId, integration_id: integrationId }, {}, client);
  }
}

module.exports = new IntegrationConfigRepository();
