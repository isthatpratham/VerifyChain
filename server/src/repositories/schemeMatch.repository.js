const BaseRepository = require('./base.repository');

class SchemeMatchRepository extends BaseRepository {
  constructor() {
    super('schemeMatch');
  }

  async findByMsmeId(msmeId, minScore = 50, client) {
    return this.findMany(
      {
        where: { msme_id: msmeId, match_score: { gte: minScore } },
        orderBy: { match_score: 'desc' },
        include: { government_scheme: true },
      },
      client
    );
  }
}

module.exports = new SchemeMatchRepository();
