const BaseRepository = require('./base.repository');
const defaultPrisma = require('../utils/prismaClient');

class ScoreCategoryRepository extends BaseRepository {
  constructor() {
    super('scoreCategory');
  }

  /**
   * List all active categories
   */
  async findActiveCategories(client = defaultPrisma) {
    return this.findMany(
      {
        where: { is_active: true },
        orderBy: { category_code: 'asc' },
      },
      client
    );
  }
}

module.exports = new ScoreCategoryRepository();
