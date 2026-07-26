/**
 * RoleAssignmentService.js
 * User Role Assignment Management per Organization and Resource Scope (Phase 11.2).
 */

const defaultPrisma = require('../utils/prismaClient');

class RoleAssignmentService {
  /**
   * Assign Role to User in Organization / Resource Scope
   */
  static async assignRole({ userId, roleId, organizationId = null, resourceType = null, resourceId = null, assignedBy = 'ADMIN' }, client = defaultPrisma) {
    const isRoleIdNum = !isNaN(Number(roleId));
    const role = await client.platformRole.findFirst({
      where: isRoleIdNum ? { id: Number(roleId) } : { code: String(roleId).toUpperCase() },
    });

    if (!role) throw new Error(`Role '${roleId}' not found for assignment.`);

    const user = await client.user.findFirst({ where: { id: Number(userId) } });
    if (!user) throw new Error(`User '${userId}' not found.`);

    const assignment = await client.userRoleAssignment.create({
      data: {
        user_id: user.id,
        role_id: role.id,
        organization_id: organizationId ? Number(organizationId) : null,
        resource_type: resourceType,
        resource_id: resourceId ? String(resourceId) : null,
        assigned_by: String(assignedBy),
      },
      include: {
        user: { include: { user_profile: true } },
        role: true,
      },
    });

    // Record audit event
    await client.roleAuditRecord.create({
      data: {
        role_id: role.id,
        action: 'USER_ASSIGNED_ROLE',
        actor_id: String(assignedBy),
        changes_json: { userId: user.id, organizationId, resourceType, resourceId },
      },
    });

    return assignment;
  }

  /**
   * Remove / Revoke Role Assignment from User
   */
  static async removeRoleAssignment(assignmentId, actorId = 'ADMIN', client = defaultPrisma) {
    const assignment = await client.userRoleAssignment.findFirst({
      where: { OR: [{ assignment_id: String(assignmentId) }, { id: isNaN(Number(assignmentId)) ? -1 : Number(assignmentId) }] },
    });

    if (!assignment) throw new Error(`Role Assignment '${assignmentId}' not found.`);

    await client.userRoleAssignment.delete({ where: { id: assignment.id } });

    await client.roleAuditRecord.create({
      data: {
        role_id: assignment.role_id,
        action: 'USER_ROLE_REMOVED',
        actor_id: String(actorId),
        changes_json: { assignmentId: assignment.assignment_id, userId: assignment.user_id },
      },
    });

    return { removed: true, assignmentId: assignment.assignment_id };
  }

  /**
   * List Role Assignments for User or Organization
   */
  static async listAssignments({ userId, organizationId }, client = defaultPrisma) {
    const where = {};
    if (userId) where.user_id = Number(userId);
    if (organizationId) where.organization_id = Number(organizationId);

    return await client.userRoleAssignment.findMany({
      where,
      include: {
        user: { include: { user_profile: true } },
        role: { include: { role_perms: { include: { permission: true } } } },
      },
      orderBy: { assigned_at: 'desc' },
    });
  }
}

module.exports = RoleAssignmentService;
