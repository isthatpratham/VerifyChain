/**
 * SavedSearchService.js
 * Saved Searches & Query Presets Service (Phase 10.3).
 */

const defaultPrisma = require('../../utils/prismaClient');

class SavedSearchService {
  /**
   * Save a Search Query & Filter Preset
   */
  static async saveSearch({ userId, name, query = null, filters = {}, isPinned = false, msmeId = 1 }, client = defaultPrisma) {
    if (!name || !name.trim()) throw new Error('Saved search name is required.');

    return await client.vaultSavedSearch.create({
      data: {
        msme_id: msmeId,
        user_id: String(userId || 'ANONYMOUS'),
        name: name.trim(),
        query,
        filters,
        is_pinned: isPinned,
      },
    });
  }

  /**
   * List Saved Searches for User
   */
  static async listSavedSearches(userId, msmeId = 1, client = defaultPrisma) {
    return await client.vaultSavedSearch.findMany({
      where: { msme_id: msmeId, user_id: String(userId || 'ANONYMOUS') },
      orderBy: [{ is_pinned: 'desc' }, { created_at: 'desc' }],
    });
  }

  /**
   * Delete Saved Search
   */
  static async deleteSavedSearch(searchId, userId, client = defaultPrisma) {
    const search = await client.vaultSavedSearch.findFirst({
      where: { OR: [{ search_id: searchId }, { id: isNaN(Number(searchId)) ? -1 : Number(searchId) }] },
    });

    if (!search) throw new Error(`Saved Search '${searchId}' not found.`);

    await client.vaultSavedSearch.delete({ where: { id: search.id } });
    return { deleted: true, searchId };
  }
}

module.exports = SavedSearchService;
