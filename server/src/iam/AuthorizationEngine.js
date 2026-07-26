/**
 * AuthorizationEngine.js
 * Centralized Authorization Decision Engine (Phase 11.2).
 */

const defaultPrisma = require('../utils/prismaClient');
const RoleInheritanceEngine = require('./RoleInheritanceEngine');
const PolicyEngine = require('./PolicyEngine');

class AuthorizationEngine {
  /**
   * Evaluate Authorization Decision for User Request (`can(user, permission, resource)`)
   */
  static async can({ user, permission, resource = null, organizationId = null }, client = defaultPrisma) {
    if (!user) {
      return { allowed: false, reason: 'Unauthenticated caller identity.' };
    }

    // 1. Check Platform Super Admin / Admin Bypass
    if (['ADMIN', 'SUPER_ADMIN', 'MSME_OWNER'].includes(user.role)) {
      const policyRes = await PolicyEngine.evaluatePolicies({ user, permission, resource }, client);
      if (policyRes.allowed) {
        return {
          allowed: true,
          decision: 'PERMIT',
          userRole: user.role,
          permission,
          policy: policyRes.policyName,
          reason: policyRes.reason,
        };
      }
    }

    // 2. Fetch User Role Assignments for Organization & Resource
    const assignments = await client.userRoleAssignment.findMany({
      where: {
        user_id: Number(user.id),
        OR: [
          { organization_id: organizationId ? Number(organizationId) : undefined },
          { organization_id: null },
        ],
      },
      include: { role: true },
    });

    // 3. Fetch Active Time-Bound Temporary Access Assignments
    const now = new Date();
    const tempAssignments = await client.temporaryAccessAssignment.findMany({
      where: {
        user_id: Number(user.id),
        status: 'ACTIVE',
        start_time: { lte: now },
        end_time: { gte: now },
      },
      include: { role: true },
    });

    const activeRoles = [
      ...assignments.map(a => a.role),
      ...tempAssignments.map(t => t.role),
    ];

    // If caller has explicit standard role matching, collect permissions
    const userRoleCode = user.role;
    const dbRole = await client.platformRole.findFirst({ where: { code: userRoleCode } });
    if (dbRole) activeRoles.push(dbRole);

    // 4. Resolve Effective Permissions Across All Roles (with inheritance)
    const effectivePermCodes = new Set();
    for (const r of activeRoles) {
      const perms = await RoleInheritanceEngine.resolveEffectivePermissions(r.id, client);
      perms.forEach(p => effectivePermCodes.add(p.code));
    }

    const hasPermission = effectivePermCodes.has(permission);

    if (!hasPermission) {
      return {
        allowed: false,
        decision: 'DENY',
        permission,
        reason: `Identity missing required permission '${permission}'.`,
      };
    }

    // 5. Evaluate Reusable Policy Rules
    const policyEval = await PolicyEngine.evaluatePolicies({ user, permission, resource }, client);

    return {
      allowed: policyEval.allowed,
      decision: policyEval.allowed ? 'PERMIT' : 'DENY',
      permission,
      policy: policyEval.policyName,
      reason: policyEval.reason,
    };
  }
}

module.exports = AuthorizationEngine;
