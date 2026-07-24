/**
 * DeveloperWorkspaceRepository.js
 * Persistence repository for DeveloperWorkspaces.
 */
const defaultPrisma = require('../../utils/prismaClient');

class DeveloperWorkspaceRepository {
  async create(data) {
    return defaultPrisma.developerWorkspace.create({ data });
  }

  async findById(id) {
    return defaultPrisma.developerWorkspace.findUnique({ where: { id: parseInt(id, 10) } });
  }

  async findByMsme(msmeId) {
    return defaultPrisma.developerWorkspace.findMany({
      where: { msme_id: parseInt(msmeId, 10) },
      orderBy: { created_at: 'desc' },
    });
  }

  async update(id, data) {
    return defaultPrisma.developerWorkspace.update({
      where: { id: parseInt(id, 10) },
      data,
    });
  }

  async delete(id) {
    return defaultPrisma.developerWorkspace.delete({
      where: { id: parseInt(id, 10) },
    });
  }
}

module.exports = new DeveloperWorkspaceRepository();
