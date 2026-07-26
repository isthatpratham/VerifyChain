/**
 * IAMFacade.js
 * Unified Enterprise Identity & Access Management Facade (Phase 11.2).
 */

const { PermissionCatalog } = require('./PermissionCatalog');
const RoleService = require('./RoleService');
const RoleInheritanceEngine = require('./RoleInheritanceEngine');
const PolicyEngine = require('./PolicyEngine');
const AuthorizationEngine = require('./AuthorizationEngine');
const RoleAssignmentService = require('./RoleAssignmentService');
const TemporaryAccessService = require('./TemporaryAccessService');
const AccessReviewService = require('./AccessReviewService');
const defaultPrisma = require('../utils/prismaClient');

class IAMFacade {
  // ─── PERMISSION CATALOG & MATRIX ──────────────────────────────────────────
  static async seedPermissions() { return await PermissionCatalog.seedPermissions(); }
  static async listPermissions(category) { return await PermissionCatalog.listPermissions(category); }

  // ─── ROLE MANAGEMENT & INHERITANCE ───────────────────────────────────────
  static async seedDefaultRoles() { return await RoleService.seedDefaultRoles(); }
  static async createCustomRole(roleData) { return await RoleService.createCustomRole(roleData); }
  static async getRoleById(roleId) { return await RoleService.getRoleById(roleId); }
  static async listRoles(msmeId) { return await RoleService.listRoles(msmeId); }
  static async resolveEffectivePermissions(roleId) { return await RoleInheritanceEngine.resolveEffectivePermissions(roleId); }
  static async validateNoCircularInheritance(roleId, proposedParentRoleId) { return await RoleInheritanceEngine.validateNoCircularInheritance(roleId, proposedParentRoleId); }

  // ─── AUTHORIZATION & POLICY EVALUATION ──────────────────────────────────
  static async can(params) { return await AuthorizationEngine.can(params); }
  static async seedPolicies() { return await PolicyEngine.seedPolicies(); }
  static async evaluatePolicies(context) { return await PolicyEngine.evaluatePolicies(context); }

  // ─── ROLE ASSIGNMENTS ───────────────────────────────────────────────────
  static async assignRole(params) { return await RoleAssignmentService.assignRole(params); }
  static async removeRoleAssignment(assignmentId, actorId) { return await RoleAssignmentService.removeRoleAssignment(assignmentId, actorId); }
  static async listAssignments(params) { return await RoleAssignmentService.listAssignments(params); }

  // ─── TEMPORARY ACCESS ───────────────────────────────────────────────────
  static async grantTemporaryAccess(params) { return await TemporaryAccessService.grantTemporaryAccess(params); }
  static async revokeTemporaryAccess(assignmentId, revokedBy) { return await TemporaryAccessService.revokeTemporaryAccess(assignmentId, revokedBy); }
  static async sweepExpiredGrants() { return await TemporaryAccessService.sweepExpiredGrants(); }
  static async listGrants(params) { return await TemporaryAccessService.listGrants(params); }

  // ─── ACCESS REVIEWS & DASHBOARD ──────────────────────────────────────────
  static async conductAccessReview(params) { return await AccessReviewService.conductAccessReview(params); }
  static async listReviews(msmeId) { return await AccessReviewService.listReviews(msmeId); }

  static async getIAMDashboardStats(client = defaultPrisma) {
    await TemporaryAccessService.sweepExpiredGrants(client);

    const [totalRoles, totalPermissions, totalAssignments, activeTempGrants, totalReviews] = await Promise.all([
      client.platformRole.count(),
      client.platformPermission.count(),
      client.userRoleAssignment.count(),
      client.temporaryAccessAssignment.count({ where: { status: 'ACTIVE' } }),
      client.accessReviewRecord.count(),
    ]);

    return {
      totalRoles,
      totalPermissions,
      totalAssignments,
      activeTempGrants,
      totalReviews,
    };
  }
}

module.exports = IAMFacade;
