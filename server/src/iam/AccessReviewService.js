/**
 * AccessReviewService.js
 * Administrative Access Reviews, Role Audits & Inactive User Flagging (Phase 11.2).
 */

const defaultPrisma = require('../utils/prismaClient');
const TemporaryAccessService = require('./TemporaryAccessService');

class AccessReviewService {
  /**
   * Conduct Administrative Access Review Audit
   */
  static async conductAccessReview({ msmeId = 1, title = 'Quarterly IAM Access Review', reviewerId = 'ADMIN' }, client = defaultPrisma) {
    await TemporaryAccessService.sweepExpiredGrants(client);

    const [totalUsers, activeAssignments, activeTempGrants, customRoles, auditRecords] = await Promise.all([
      client.user.count(),
      client.userRoleAssignment.count(),
      client.temporaryAccessAssignment.count({ where: { status: 'ACTIVE' } }),
      client.platformRole.count({ where: { is_custom: true } }),
      client.roleAuditRecord.count(),
    ]);

    // Flag inactive users who retain active role assignments
    const inactiveUsers = await client.user.findMany({
      where: {
        is_active: false,
        role_assignments: { some: {} },
      },
      include: { role_assignments: { include: { role: true } } },
    });

    const summaryJson = {
      totalUsers,
      activeAssignments,
      activeTempGrants,
      customRoles,
      auditRecordsCount: auditRecords,
      inactiveUsersWithAccess: inactiveUsers.map(u => ({
        userId: u.id,
        name: u.name,
        email: u.email,
        assignedRoles: u.role_assignments.map(ra => ra.role.name),
      })),
      reviewTimestamp: new Date(),
    };

    const review = await client.accessReviewRecord.create({
      data: {
        msme_id: Number(msmeId),
        title,
        reviewer_id: String(reviewerId),
        status: 'COMPLETED',
        summary_json: summaryJson,
      },
    });

    return review;
  }

  /**
   * List Access Review Audit Logs
   */
  static async listReviews(msmeId = 1, client = defaultPrisma) {
    return await client.accessReviewRecord.findMany({
      where: { msme_id: Number(msmeId) },
      orderBy: { reviewed_at: 'desc' },
      take: 20,
    });
  }
}

module.exports = AccessReviewService;
