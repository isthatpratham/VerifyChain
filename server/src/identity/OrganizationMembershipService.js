/**
 * OrganizationMembershipService.js
 * Manage User-Organization Memberships, Roles, and Primary Switching (Phase 11.1).
 */

const defaultPrisma = require('../utils/prismaClient');

class OrganizationMembershipService {
  /**
   * Add User Membership to an Organization
   */
  static async addMember({ organizationId, userId, role = 'MEMBER', isPrimary = false }, client = defaultPrisma) {
    const [org, user] = await Promise.all([
      client.platformOrganization.findFirst({
        where: { OR: [{ id: isNaN(Number(organizationId)) ? -1 : Number(organizationId) }, { organization_id: String(organizationId) }] },
      }),
      client.user.findFirst({
        where: { id: Number(userId) },
      }),
    ]);

    if (!org) throw new Error(`Organization '${organizationId}' not found.`);
    if (!user) throw new Error(`User '${userId}' not found.`);

    // If isPrimary, clear other primary flags for user
    if (isPrimary) {
      await client.organizationMembership.updateMany({
        where: { user_id: user.id },
        data: { is_primary: false },
      });
    }

    const membership = await client.organizationMembership.upsert({
      where: {
        organization_id_user_id: {
          organization_id: org.id,
          user_id: user.id,
        },
      },
      update: {
        role,
        status: 'ACTIVE',
        is_primary: isPrimary,
      },
      create: {
        organization_id: org.id,
        user_id: user.id,
        role,
        status: 'ACTIVE',
        is_primary: isPrimary,
      },
      include: {
        organization: true,
        user: true,
      },
    });

    return membership;
  }

  /**
   * Remove or Revoke Member from Organization
   */
  static async removeMember({ organizationId, userId }, client = defaultPrisma) {
    const org = await client.platformOrganization.findFirst({
      where: { OR: [{ id: isNaN(Number(organizationId)) ? -1 : Number(organizationId) }, { organization_id: String(organizationId) }] },
    });

    if (!org) throw new Error(`Organization '${organizationId}' not found.`);

    await client.organizationMembership.deleteMany({
      where: { organization_id: org.id, user_id: Number(userId) },
    });

    return { removed: true, organizationId: org.id, userId: Number(userId) };
  }

  /**
   * Switch Active Primary Organization for User
   */
  static async switchPrimaryOrganization({ userId, targetOrganizationId }, client = defaultPrisma) {
    const org = await client.platformOrganization.findFirst({
      where: { OR: [{ id: isNaN(Number(targetOrganizationId)) ? -1 : Number(targetOrganizationId) }, { organization_id: String(targetOrganizationId) }] },
    });

    if (!org) throw new Error(`Target Organization '${targetOrganizationId}' not found.`);

    const membership = await client.organizationMembership.findFirst({
      where: { organization_id: org.id, user_id: Number(userId), status: 'ACTIVE' },
    });

    if (!membership) {
      throw new Error(`User '${userId}' is not an active member of organization '${org.name}'.`);
    }

    await client.$transaction([
      client.organizationMembership.updateMany({
        where: { user_id: Number(userId) },
        data: { is_primary: false },
      }),
      client.organizationMembership.update({
        where: { id: membership.id },
        data: { is_primary: true },
      }),
    ]);

    return { switched: true, activeOrganization: org };
  }

  /**
   * List Organization Members
   */
  static async listMembers(organizationId, client = defaultPrisma) {
    const org = await client.platformOrganization.findFirst({
      where: { OR: [{ id: isNaN(Number(organizationId)) ? -1 : Number(organizationId) }, { organization_id: String(organizationId) }] },
    });

    if (!org) throw new Error(`Organization '${organizationId}' not found.`);

    return await client.organizationMembership.findMany({
      where: { organization_id: org.id },
      include: {
        user: {
          include: { user_profile: true },
        },
      },
      orderBy: { joined_at: 'desc' },
    });
  }
}

module.exports = OrganizationMembershipService;
