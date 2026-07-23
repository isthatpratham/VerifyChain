const BaseRepository = require('./base.repository');

class AlertRepository extends BaseRepository {
  constructor() {
    super('alert');
  }

  async findByMsmeId(msmeId, client) {
    return this.findMany(
      { where: { msme_id: msmeId }, orderBy: { scheduled_for: 'desc' } },
      client
    );
  }
}

module.exports = new AlertRepository();
