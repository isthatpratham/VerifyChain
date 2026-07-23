const BaseRepository = require('./base.repository');

class DocumentRepository extends BaseRepository {
  constructor() {
    super('document');
  }

  async findByMsmeId(msmeId, client) {
    return this.findMany(
      { where: { msme_id: msmeId }, orderBy: { uploaded_at: 'desc' } },
      client
    );
  }
}

module.exports = new DocumentRepository();
