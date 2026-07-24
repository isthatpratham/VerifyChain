/**
 * SecurityAlertRepository.js
 * Persistence repository for SecurityAlert entities.
 */
const defaultPrisma = require('../../utils/prismaClient');

class SecurityAlertRepository {
  async create(data) {
    return defaultPrisma.securityAlert.create({ data });
  }

  async findUnresolved(msmeId) {
    return defaultPrisma.securityAlert.findMany({
      where: { msme_id: parseInt(msmeId, 10), is_resolved: false },
      orderBy: { created_at: 'desc' },
    });
  }

  async findAll(msmeId) {
    return defaultPrisma.securityAlert.findMany({
      where: { msme_id: parseInt(msmeId, 10) },
      orderBy: { created_at: 'desc' },
    });
  }

  async resolve(id) {
    return defaultPrisma.securityAlert.update({
      where: { id: parseInt(id, 10) },
      data: { is_resolved: true, resolved_at: new Date() },
    });
  }
}

module.exports = new SecurityAlertRepository();
