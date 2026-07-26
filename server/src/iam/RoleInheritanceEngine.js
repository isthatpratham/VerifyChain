/**
 * RoleInheritanceEngine.js
 * Role Inheritance Resolution & Circular Reference Protection (Phase 11.2).
 */

const defaultPrisma = require('../utils/prismaClient');

class RoleInheritanceEngine {
  /**
   * Resolve All Effective Permissions for a Role (Direct + Parent Inherited)
   */
  static async resolveEffectivePermissions(roleId, client = defaultPrisma) {
    const isId = !isNaN(Number(roleId));
    const role = await client.platformRole.findFirst({
      where: isId ? { id: Number(roleId) } : { code: String(roleId).toUpperCase() },
      include: {
        role_perms: { include: { permission: true } },
      },
    });

    if (!role) throw new Error(`Role '${roleId}' not found for inheritance resolution.`);

    const effectivePermissions = new Map();
    const visitedRoleIds = new Set();

    let currentRoleId = role.id;

    while (currentRoleId) {
      if (visitedRoleIds.has(currentRoleId)) {
        console.warn(`[RoleInheritance] Circular inheritance detected at Role ID '${currentRoleId}'. Breaking loop.`);
        break;
      }
      visitedRoleIds.add(currentRoleId);

      const currentRole = await client.platformRole.findUnique({
        where: { id: currentRoleId },
        include: { role_perms: { include: { permission: true } } },
      });

      if (!currentRole) break;

      for (const rp of currentRole.role_perms) {
        if (!rp.permission.is_deprecated) {
          effectivePermissions.set(rp.permission.code, rp.permission);
        }
      }

      currentRoleId = currentRole.parent_role_id;
    }

    return Array.from(effectivePermissions.values());
  }

  /**
   * Validate Parent Role Assignment to Prevent Circular Inheritance Loops
   */
  static async validateNoCircularInheritance(roleId, proposedParentRoleId, client = defaultPrisma) {
    if (Number(roleId) === Number(proposedParentRoleId)) {
      throw new Error(`Role cannot inherit from itself (Role ID: ${roleId}).`);
    }

    const visited = new Set([Number(roleId)]);
    let currentId = Number(proposedParentRoleId);

    while (currentId) {
      if (visited.has(currentId)) {
        throw new Error(`Circular role inheritance detected: Role ${proposedParentRoleId} eventually inherits from Role ${roleId}.`);
      }
      visited.add(currentId);

      const parentRole = await client.platformRole.findUnique({ where: { id: currentId } });
      currentId = parentRole ? parentRole.parent_role_id : null;
    }

    return true;
  }
}

module.exports = RoleInheritanceEngine;
