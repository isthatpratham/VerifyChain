const BaseRepository = require('./base.repository');
const defaultPrisma = require('../utils/prismaClient');

class HealthScoreSnapshotRepository extends BaseRepository {
  constructor() {
    super('healthScoreSnapshot');
  }

  /**
   * Get latest snapshot for an MSME
   */
  async findLatestByMsmeId(msmeId, client = defaultPrisma) {
    return this.findFirst(
      {
        where: { msme_id: msmeId },
        orderBy: { evaluated_at: 'desc' },
      },
      client
    );
  }

  /**
   * Get paginated snapshot history for an MSME
   */
  async findHistoryByMsmeId(msmeId, options = {}, client = defaultPrisma) {
    const { skip = 0, take = 10 } = options;
    const [items, total] = await Promise.all([
      client.healthScoreSnapshot.findMany({
        where: { msme_id: msmeId },
        orderBy: { evaluated_at: 'desc' },
        skip,
        take,
      }),
      client.healthScoreSnapshot.count({ where: { msme_id: msmeId } }),
    ]);

    return { items, total };
  }
}

module.exports = new HealthScoreSnapshotRepository();
