/**
 * IdentitySearchService.js
 * Administration Search Engine across Users, Organizations, Invitations & Memberships (Phase 11.1).
 */

const defaultPrisma = require('../utils/prismaClient');

class IdentitySearchService {
  /**
   * Universal Administration Search
   */
  static async search({ query, category = 'ALL', limit = 20 }, client = defaultPrisma) {
    if (!query || query.trim() === '') {
      return { users: [], organizations: [], invitations: [], memberships: [] };
    }

    const searchTerm = query.trim();
    const results = {};

    if (['ALL', 'USERS'].includes(category.toUpperCase())) {
      results.users = await client.user.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        include: { user_profile: true },
        take: Number(limit),
      });
    }

    if (['ALL', 'ORGANIZATIONS'].includes(category.toUpperCase())) {
      results.organizations = await client.platformOrganization.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { slug: { contains: searchTerm, mode: 'insensitive' } },
            { legal_name: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        take: Number(limit),
      });
    }

    if (['ALL', 'INVITATIONS'].includes(category.toUpperCase())) {
      results.invitations = await client.organizationInvitation.findMany({
        where: {
          OR: [
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { role: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        include: { organization: true },
        take: Number(limit),
      });
    }

    return results;
  }
}

module.exports = IdentitySearchService;
