/**
 * IdentityFacade.js
 * Unified Enterprise Administration & Identity Facade (Phase 11.1).
 */

const IdentityService = require('./IdentityService');
const OrganizationService = require('./OrganizationService');
const OrganizationMembershipService = require('./OrganizationMembershipService');
const InvitationService = require('./InvitationService');
const UserLifecycleService = require('./UserLifecycleService');
const OrganizationLifecycleService = require('./OrganizationLifecycleService');
const ProfileAdministrationService = require('./ProfileAdministrationService');
const OrganizationAdministrationService = require('./OrganizationAdministrationService');
const IdentitySearchService = require('./IdentitySearchService');
const defaultPrisma = require('../utils/prismaClient');

class IdentityFacade {
  // ─── USER & IDENTITY METHODS ──────────────────────────────────────────────
  static async createUser(userData) { return await IdentityService.createUser(userData); }
  static async getUserById(userId) { return await IdentityService.getUserById(userId); }
  static async listUsers(filterParams) { return await IdentityService.listUsers(filterParams); }
  static async transitionUserStatus(params) { return await UserLifecycleService.transitionStatus(params); }
  static async suspendUser(userId, reason, changedBy) { return await UserLifecycleService.suspendUser(userId, reason, changedBy); }
  static async restoreUser(userId, reason, changedBy) { return await UserLifecycleService.restoreUser(userId, reason, changedBy); }
  static async softDeleteUser(userId, reason, changedBy) { return await UserLifecycleService.softDeleteUser(userId, reason, changedBy); }
  static async updateProfile(userId, profileData) { return await ProfileAdministrationService.updateProfile(userId, profileData); }

  // ─── ORGANIZATION METHODS ────────────────────────────────────────────────
  static async createOrganization(orgData) { return await OrganizationService.createOrganization(orgData); }
  static async getOrganizationById(identifier) { return await OrganizationService.getOrganizationById(identifier); }
  static async listOrganizations(filterParams) { return await OrganizationService.listOrganizations(filterParams); }
  static async transitionOrganizationStatus(params) { return await OrganizationLifecycleService.transitionStatus(params); }
  static async suspendOrganization(orgId, reason, changedBy) { return await OrganizationLifecycleService.suspendOrganization(orgId, reason, changedBy); }
  static async activateOrganization(orgId, reason, changedBy) { return await OrganizationLifecycleService.activateOrganization(orgId, reason, changedBy); }
  static async updateOrganization(orgId, updateData) { return await OrganizationAdministrationService.updateOrganization(orgId, updateData); }

  // ─── MEMBERSHIP METHODS ─────────────────────────────────────────────────
  static async addMember(params) { return await OrganizationMembershipService.addMember(params); }
  static async removeMember(params) { return await OrganizationMembershipService.removeMember(params); }
  static async switchPrimaryOrganization(params) { return await OrganizationMembershipService.switchPrimaryOrganization(params); }
  static async listMembers(orgId) { return await OrganizationMembershipService.listMembers(orgId); }

  // ─── INVITATION METHODS ──────────────────────────────────────────────────
  static async createInvitation(params) { return await InvitationService.createInvitation(params); }
  static async resendInvitation(invId, performedBy) { return await InvitationService.resendInvitation(invId, performedBy); }
  static async cancelInvitation(invId, performedBy) { return await InvitationService.cancelInvitation(invId, performedBy); }
  static async acceptInvitation(params) { return await InvitationService.acceptInvitation(params); }
  static async bulkInvite(params) { return await InvitationService.bulkInvite(params); }
  static async listInvitations(filterParams) { return await InvitationService.listInvitations(filterParams); }

  // ─── SEARCH & DASHBOARD STATISTICS ──────────────────────────────────────
  static async search(params) { return await IdentitySearchService.search(params); }

  static async getDashboardMetrics(client = defaultPrisma) {
    const [totalUsers, activeUsers, totalOrgs, activeOrgs, pendingInvs, totalMemberships] = await Promise.all([
      client.user.count(),
      client.user.count({ where: { is_active: true } }),
      client.platformOrganization.count(),
      client.platformOrganization.count({ where: { status: 'ACTIVE' } }),
      client.organizationInvitation.count({ where: { status: 'PENDING' } }),
      client.organizationMembership.count({ where: { status: 'ACTIVE' } }),
    ]);

    return {
      totalUsers,
      activeUsers,
      suspendedUsers: totalUsers - activeUsers,
      totalOrganizations: totalOrgs,
      activeOrganizations: activeOrgs,
      pendingInvitations: pendingInvs,
      activeMemberships: totalMemberships,
    };
  }
}

module.exports = IdentityFacade;
