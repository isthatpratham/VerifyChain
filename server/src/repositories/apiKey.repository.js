const BaseRepository = require('./base.repository');

class ApiKeyRepository extends BaseRepository {
  constructor() {
    super('apiKey');
  }

  async findByKeyHash(keyHash, client) {
    return this.findUnique({ key_hash: keyHash }, {}, client);
  }

  async findByDeveloperAppId(developerAppId, client) {
    return this.findMany({ where: { developer_app_id: developerAppId }, orderBy: { created_at: 'desc' } }, client);
  }
}

module.exports = new ApiKeyRepository();
