/**
 * TemporaryAccessService.js
 * Time-Bound Temporary Access Grants & Automatic Expiration Engine (Phase 11.2).
 */

const defaultPrisma = require('../utils/prismaClient');

class TemporaryAccessService {
  /**
   * Grant Time-Bound Temporary Access
   */
  static async grantTemporaryAccess({ userId, roleId, organizationId = null, durationDays = 7, reason = 'Temporary audit access', grantedBy = 'ADMIN' }, client = defaultPrisma) {
    const isRoleIdNum = !isNaN(Number(roleId));
    const role = await client.platformRole.findFirst({
      where: isRoleIdNum ? { id: Number(roleId) } : { code: String(roleId).toUpperCase() },
    });

    if (!role) throw new Error(`Role '${roleId}' not found for temporary access grant.`);

    const user = await client.user.findFirst({ where: { id: Number(userId) } });
    if (!user) throw new Error(`User '${userId}' not found.`);

    const startTime = new Date();
    const endTime = new Date(Date.now() + Number(durationDays) * 24 * 60 * 60 * 1000);

    const tempAssignment = await client.temporaryAccessAssignment.create({
      data: {
        user_id: user.id,
        role_id: role.id,
        organization_id: organizationId ? Number(organizationId) : null,
        start_time: startTime,
        end_time: endTime,
        status: 'ACTIVE',
        reason,
        granted_by: String(grantedBy),
      },
      include: {
        user: { include: { user_profile: true } },
        role: true,
      },
    });

    await client.roleAuditRecord.create({
      data: {
        role_id: role.id,
        action: 'TEMPORARY_ACCESS_GRANTED',
        actor_id: String(grantedBy),
        changes_json: { userId: user.id, durationDays, startTime, endTime, reason },
      },
    });

    return tempAssignment;
  }

  /**
   * Revoke Temporary Access Grant Early
   */
  static async revokeTemporaryAccess(assignmentId, revokedBy = 'ADMIN', client = defaultPrisma) {
    const tempAssign = await client.temporaryAccessAssignment.findFirst({
      where: { OR: [{ assignment_id: String(assignmentId) }, { id: isNaN(Number(assignmentId)) ? -1 : Number(assignmentId) }] },
    });

    if (!tempAssign) throw new Error(`Temporary Access Assignment '${assignmentId}' not found.`);

    const updated = await client.temporaryAccessAssignment.update({
      where: { id: tempAssign.id },
      data: { status: 'REVOKED' },
    });

    await client.roleAuditRecord.create({
      data: {
        role_id: tempAssign.role_id,
        action: 'TEMPORARY_ACCESS_REVOKED',
        actor_id: String(revokedBy),
        changes_json: { assignmentId: tempAssign.assignment_id, userId: tempAssign.user_id },
      },
    });

    return updated;
  }

  /**
   * Sweep & Enforce Auto-Expiration of Passed Grants
   */
  static async sweepExpiredGrants(client = defaultPrisma) {
    const now = new Date();
    const expiredRecords = await client.temporaryAccessAssignment.updateMany({
      where: {
        status: 'ACTIVE',
        end_time: { lt: now },
      },
      data: { status: 'EXPIRED' },
    });

    return { sweptCount: expiredRecords.count, timestamp: now };
  }

  /**
   * List Temporary Access Grants
   */
  static async listGrants({ userId, status = 'ACTIVE' }, client = defaultPrisma) {
    await this.sweepExpiredGrants(client);

    const where = {};
    if (userId) where.user_id = Number(userId);
    if (status && status !== 'ALL') where.status = status.toUpperCase();

    return await client.temporaryAccessAssignment.findMany({
      where,
      include: {
        user: { include: { user_profile: true } },
        role: true,
      },
      orderBy: { end_time: 'asc' },
    });
  }
}

module.exports = TemporaryAccessService;
