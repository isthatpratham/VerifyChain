const BaseRepository = require('./base.repository');

class GovernmentSchemeRepository extends BaseRepository {
  constructor() {
    super('governmentScheme');
  }

  async findActiveSchemes(client) {
    return this.findMany(
      { where: { is_active: true }, orderBy: { scheme_name: 'asc' } },
      client
    );
  }
}

module.exports = new GovernmentSchemeRepository();
