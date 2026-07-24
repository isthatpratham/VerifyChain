const BaseRepository = require('./base.repository');

class IntegrationAuditRepository extends BaseRepository {
  constructor() {
    super('integrationAuditLog');
  }

  async findByResource(resourceType, resourceId, client) {
    return this.findMany(
      {
        where: { resource_type: resourceType, resource_id: String(resourceId) },
        orderBy: { created_at: 'desc' },
      },
      client
    );
  }
}

module.exports = new IntegrationAuditRepository();
