const BaseRepository = require('./base.repository');

class ComplianceRecordRepository extends BaseRepository {
  constructor() {
    super('complianceRecord');
  }

  /**
   * Find a specific compliance record by MSME ID and Authority
   */
  async findByMsmeAndAuthority(msmeId, authority, client) {
    return this.findUnique(
      { msme_id_authority: { msme_id: msmeId, authority } },
      {},
      client
    );
  }

  /**
   * Find all compliance records for an MSME
   */
  async findByMsmeId(msmeId, client) {
    return this.findMany(
      { where: { msme_id: msmeId }, orderBy: { authority: 'asc' } },
      client
    );
  }

  /**
   * Paginated, searchable, and filterable list of compliance records
   */
  async findPaginated({
    msmeId,
    status,
    priority,
    authority,
    search,
    page = 1,
    limit = 10,
    sortBy = 'updated_at',
    sortOrder = 'desc',
  }, client) {
    const where = { msme_id: msmeId };

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (authority) {
      where.authority = authority;
    }

    if (search && search.trim()) {
      const query = search.trim();
      where.OR = [
        { notes: { contains: query, mode: 'insensitive' } },
        { filing_reference: { contains: query, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;
    const orderBy = { [sortBy]: sortOrder.toLowerCase() };

    const [items, total] = await Promise.all([
      this.findMany({ where, skip, take: limit, orderBy }, client),
      this.count(where, client),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Bulk upsert records for an MSME
   */
  async bulkUpsert(msmeId, records, client) {
    const operations = records.map((rec) =>
      this.upsert(
        { msme_id_authority: { msme_id: msmeId, authority: rec.authority } },
        { ...rec, msme_id: msmeId },
        { ...rec },
        {},
        client
      )
    );
    return Promise.all(operations);
  }
}

module.exports = new ComplianceRecordRepository();
