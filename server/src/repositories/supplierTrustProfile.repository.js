const BaseRepository = require('./base.repository');
const defaultPrisma = require('../utils/prismaClient');

class SupplierTrustProfileRepository extends BaseRepository {
  constructor() {
    super('supplierTrustProfile');
  }

  /**
   * Find profile by MSME ID
   */
  async findByMsmeId(msmeId, client = defaultPrisma) {
    return this.findFirst({ msme_id: msmeId }, {}, client);
  }

  /**
   * Find public profile by slug
   */
  async findBySlug(slug, client = defaultPrisma) {
    return this.findFirst({ public_slug: slug }, {}, client);
  }

  /**
   * Find profile by public identifier
   */
  async findByIdentifier(identifier, client = defaultPrisma) {
    return this.findFirst({ public_identifier: identifier }, {}, client);
  }
}

module.exports = new SupplierTrustProfileRepository();
