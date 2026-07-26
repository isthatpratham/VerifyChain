/**
 * OrganizationLifecycleService.js
 * Organization Lifecycle State Machine for Platform Administration (Phase 11.1).
 */

const defaultPrisma = require('../utils/prismaClient');

const ALLOWED_ORG_STATES = ['CREATED', 'ACTIVE', 'SUSPENDED', 'TRIAL', 'INACTIVE', 'ARCHIVED', 'DELETED', 'RESTORED'];

class OrganizationLifecycleService {
  /**
   * Transition Organization Lifecycle State
   */
  static async transitionStatus({ organizationId, targetStatus, reason = null, changedBy = 'ADMIN' }, client = defaultPrisma) {
    const statusUpper = targetStatus.toUpperCase();
    if (!ALLOWED_ORG_STATES.includes(statusUpper)) {
      throw new Error(`Invalid Organization target state '${targetStatus}'. Allowed: ${ALLOWED_ORG_STATES.join(', ')}`);
    }

    const org = await client.platformOrganization.findFirst({
      where: { OR: [{ id: isNaN(Number(organizationId)) ? -1 : Number(organizationId) }, { organization_id: String(organizationId) }] },
    });

    if (!org) {
      throw new Error(`Platform Organization '${organizationId}' not found.`);
    }

    const fromStatus = org.status;

    const updatedOrg = await client.platformOrganization.update({
      where: { id: org.id },
      data: { status: statusUpper },
    });

    const history = await client.organizationStatusHistory.create({
      data: {
        organization_id: org.id,
        from_status: fromStatus,
        to_status: statusUpper,
        reason: reason || `Admin lifecycle transition to ${statusUpper}`,
        changed_by: String(changedBy),
      },
    });

    return {
      organizationId: org.id,
      fromStatus,
      toStatus: statusUpper,
      historyId: history.id,
      organization: updatedOrg,
    };
  }

  /**
   * Suspend Organization
   */
  static async suspendOrganization(organizationId, reason = 'Compliance audit pending', changedBy = 'ADMIN', client = defaultPrisma) {
    return await this.transitionStatus({ organizationId, targetStatus: 'SUSPENDED', reason, changedBy }, client);
  }

  /**
   * Activate / Restore Organization
   */
  static async activateOrganization(organizationId, reason = 'Compliance verification passed', changedBy = 'ADMIN', client = defaultPrisma) {
    return await this.transitionStatus({ organizationId, targetStatus: 'ACTIVE', reason, changedBy }, client);
  }
}

module.exports = OrganizationLifecycleService;
