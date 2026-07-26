/**
 * UserLifecycleService.js
 * User Lifecycle State Machine & Account Administration for Platform Users (Phase 11.1).
 */

const defaultPrisma = require('../utils/prismaClient');

const ALLOWED_USER_STATES = ['INVITED', 'PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'LOCKED', 'DISABLED', 'ARCHIVED', 'DELETED', 'RESTORED'];

class UserLifecycleService {
  /**
   * Transition User Lifecycle State
   */
  static async transitionStatus({ userId, targetStatus, reason = null, changedBy = 'ADMIN' }, client = defaultPrisma) {
    const statusUpper = targetStatus.toUpperCase();
    if (!ALLOWED_USER_STATES.includes(statusUpper)) {
      throw new Error(`Invalid User target state '${targetStatus}'. Allowed: ${ALLOWED_USER_STATES.join(', ')}`);
    }

    const user = await client.user.findFirst({
      where: { id: Number(userId) },
    });

    if (!user) {
      throw new Error(`User '${userId}' not found.`);
    }

    const fromStatus = user.is_active ? 'ACTIVE' : 'SUSPENDED';
    const isActiveNew = !['SUSPENDED', 'LOCKED', 'DISABLED', 'DELETED', 'ARCHIVED'].includes(statusUpper);

    await client.user.update({
      where: { id: user.id },
      data: { is_active: isActiveNew },
    });

    const history = await client.userStatusHistory.create({
      data: {
        user_id: user.id,
        from_status: fromStatus,
        to_status: statusUpper,
        reason: reason || `Admin transition to ${statusUpper}`,
        changed_by: String(changedBy),
      },
    });

    return {
      userId: user.id,
      fromStatus,
      toStatus: statusUpper,
      isActive: isActiveNew,
      historyId: history.id,
    };
  }

  /**
   * Suspend Account
   */
  static async suspendUser(userId, reason = 'Administrative suspension', changedBy = 'ADMIN', client = defaultPrisma) {
    return await this.transitionStatus({ userId, targetStatus: 'SUSPENDED', reason, changedBy }, client);
  }

  /**
   * Restore / Activate Account
   */
  static async restoreUser(userId, reason = 'Administrative account restoration', changedBy = 'ADMIN', client = defaultPrisma) {
    return await this.transitionStatus({ userId, targetStatus: 'ACTIVE', reason, changedBy }, client);
  }

  /**
   * Soft Delete User Account
   */
  static async softDeleteUser(userId, reason = 'Account decommission', changedBy = 'ADMIN', client = defaultPrisma) {
    return await this.transitionStatus({ userId, targetStatus: 'DELETED', reason, changedBy }, client);
  }
}

module.exports = UserLifecycleService;
