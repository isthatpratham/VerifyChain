const BaseRepository = require('./base.repository');

class DeveloperAppRepository extends BaseRepository {
  constructor() {
    super('developerApplication');
  }

  async findByAppId(appId, client) {
    return this.findUnique({ app_id: appId }, {}, client);
  }

  async findByMsmeId(msmeId, client) {
    return this.findMany({ where: { msme_id: msmeId }, orderBy: { created_at: 'desc' } }, client);
  }
}

module.exports = new DeveloperAppRepository();
