const BaseRepository = require('./base.repository');
const defaultPrisma = require('../utils/prismaClient');

class HealthScoreConfigRepository extends BaseRepository {
  constructor() {
    super('healthScoreConfig');
  }

  /**
   * Find active health score configuration
   */
  async findActiveConfig(client = defaultPrisma) {
    return this.findFirst(
      { status: 'ACTIVE' },
      { orderBy: { effective_date: 'desc' } },
      client
    );
  }

  /**
   * Find config by version string (e.g., 'v1.0.0')
   */
  async findByVersion(version, client = defaultPrisma) {
    return this.findUnique({ config_version: version }, {}, client);
  }
}

module.exports = new HealthScoreConfigRepository();
