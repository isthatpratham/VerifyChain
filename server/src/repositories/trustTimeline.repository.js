const BaseRepository = require('./base.repository');
const defaultPrisma = require('../utils/prismaClient');

class TrustTimelineRepository extends BaseRepository {
  constructor() {
    super('trustTimelineEvent');
  }

  /**
   * Get timeline events for a profile
   */
  async findByProfileId(profileId, client = defaultPrisma) {
    return this.findMany(
      {
        where: { supplier_trust_profile_id: profileId },
        orderBy: { created_at: 'desc' },
      },
      client
    );
  }
}

module.exports = new TrustTimelineRepository();
