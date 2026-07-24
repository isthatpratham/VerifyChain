/**
 * SavedFilterRepository.js
 * Persistence repository for SavedFilter entities.
 */
const defaultPrisma = require('../../utils/prismaClient');

class SavedFilterRepository {
  async create(data) {
    return defaultPrisma.savedFilter.create({ data });
  }

  async findByMsme(msmeId, category = null) {
    const where = { msme_id: parseInt(msmeId, 10) };
    if (category) where.category = category;
    return defaultPrisma.savedFilter.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
  }

  async delete(id) {
    return defaultPrisma.savedFilter.delete({
      where: { id: parseInt(id, 10) },
    });
  }
}

module.exports = new SavedFilterRepository();
