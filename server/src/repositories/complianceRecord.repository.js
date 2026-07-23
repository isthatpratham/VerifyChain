const BaseRepository = require('./base.repository');

class ComplianceRecordRepository extends BaseRepository {
  constructor() {
    super('complianceRecord');
  }

  async findByMsmeAndAuthority(msmeId, authority, client) {
    return this.findUnique(
      { msme_id_authority: { msme_id: msmeId, authority } },
      {},
      client
    );
  }

  async findByMsmeId(msmeId, client) {
    return this.findMany(
      { where: { msme_id: msmeId }, orderBy: { authority: 'asc' } },
      client
    );
  }
}

module.exports = new ComplianceRecordRepository();
