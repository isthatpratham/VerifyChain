const BaseRepository = require('./base.repository');
const defaultPrisma = require('../utils/prismaClient');

class TrustMetadataRepository extends BaseRepository {
  constructor() {
    super('trustMetadata');
  }

  /**
   * Get latest metadata for a trust profile
   */
  async findLatestByProfileId(profileId, client = defaultPrisma) {
    return this.findFirst(
      {
        where: { supplier_trust_profile_id: profileId },
        orderBy: { created_at: 'desc' },
      },
      client
    );
  }
}

module.exports = new TrustMetadataRepository();
