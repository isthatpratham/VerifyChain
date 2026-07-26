/**
 * InvitationService.js
 * Enterprise User & Organization Invitation System (Phase 11.1).
 */

const crypto = require('crypto');
const defaultPrisma = require('../utils/prismaClient');
const OrganizationMembershipService = require('./OrganizationMembershipService');

class InvitationService {
  /**
   * Invite User to Organization
   */
  static async createInvitation({ email, organizationId, role = 'MEMBER', invitedBy = 'ADMIN', notes = null, expiryDays = 7 }, client = defaultPrisma) {
    const org = await client.platformOrganization.findFirst({
      where: { OR: [{ id: isNaN(Number(organizationId)) ? -1 : Number(organizationId) }, { organization_id: String(organizationId) }] },
    });

    if (!org) throw new Error(`Organization '${organizationId}' not found for invitation.`);

    const normalizedEmail = email.toLowerCase().trim();
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

    const invitation = await client.organizationInvitation.create({
      data: {
        token,
        email: normalizedEmail,
        organization_id: org.id,
        role,
        status: 'PENDING',
        invited_by: String(invitedBy),
        expires_at: expiresAt,
        notes,
      },
    });

    await client.invitationHistory.create({
      data: {
        invitation_id: invitation.id,
        action: 'SENT',
        performed_by: String(invitedBy),
        details: { email: normalizedEmail, role, expiresAt },
      },
    });

    return invitation;
  }

  /**
   * Resend Invitation & Refresh Expiration
   */
  static async resendInvitation(invitationId, performedBy = 'ADMIN', client = defaultPrisma) {
    const invitation = await client.organizationInvitation.findFirst({
      where: { OR: [{ invitation_id: String(invitationId) }, { id: isNaN(Number(invitationId)) ? -1 : Number(invitationId) }] },
    });

    if (!invitation) throw new Error(`Invitation '${invitationId}' not found.`);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const updated = await client.organizationInvitation.update({
      where: { id: invitation.id },
      data: {
        status: 'PENDING',
        expires_at: expiresAt,
      },
    });

    await client.invitationHistory.create({
      data: {
        invitation_id: invitation.id,
        action: 'RESENT',
        performed_by: String(performedBy),
        details: { newExpiration: expiresAt },
      },
    });

    return updated;
  }

  /**
   * Cancel / Revoke Invitation
   */
  static async cancelInvitation(invitationId, performedBy = 'ADMIN', client = defaultPrisma) {
    const invitation = await client.organizationInvitation.findFirst({
      where: { OR: [{ invitation_id: String(invitationId) }, { id: isNaN(Number(invitationId)) ? -1 : Number(invitationId) }] },
    });

    if (!invitation) throw new Error(`Invitation '${invitationId}' not found.`);

    const updated = await client.organizationInvitation.update({
      where: { id: invitation.id },
      data: { status: 'CANCELLED' },
    });

    await client.invitationHistory.create({
      data: {
        invitation_id: invitation.id,
        action: 'CANCELLED',
        performed_by: String(performedBy),
      },
    });

    return updated;
  }

  /**
   * Accept Invitation & Automatically Provision Membership
   */
  static async acceptInvitation({ token, userId }, client = defaultPrisma) {
    const invitation = await client.organizationInvitation.findFirst({
      where: { token: String(token), status: 'PENDING' },
      include: { organization: true },
    });

    if (!invitation) {
      throw new Error('Invalid, expired, or already accepted invitation token.');
    }

    if (new Date(invitation.expires_at) < new Date()) {
      await client.organizationInvitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' },
      });
      throw new Error('Invitation has expired. Please request a new invitation.');
    }

    // Add user as member to organization
    const membership = await OrganizationMembershipService.addMember({
      organizationId: invitation.organization_id,
      userId: Number(userId),
      role: invitation.role,
      isPrimary: true,
    }, client);

    await client.organizationInvitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED' },
    });

    await client.invitationHistory.create({
      data: {
        invitation_id: invitation.id,
        action: 'ACCEPTED',
        performed_by: `USER_${userId}`,
        details: { membershipId: membership.membership_id },
      },
    });

    return { accepted: true, membership, organization: invitation.organization };
  }

  /**
   * Bulk Invitations Execution
   */
  static async bulkInvite({ emails = [], organizationId, role = 'MEMBER', invitedBy = 'ADMIN' }, client = defaultPrisma) {
    const results = [];
    for (const email of emails) {
      try {
        const inv = await this.createInvitation({ email, organizationId, role, invitedBy }, client);
        results.push({ email, success: true, invitationId: inv.invitation_id });
      } catch (err) {
        results.push({ email, success: false, error: err.message });
      }
    }
    return results;
  }

  /**
   * List Invitations
   */
  static async listInvitations(filterParams = {}, client = defaultPrisma) {
    const { organizationId, status, limit = 50 } = filterParams;
    const where = {};
    if (status) where.status = status;
    if (organizationId) {
      const org = await client.platformOrganization.findFirst({
        where: { OR: [{ id: isNaN(Number(organizationId)) ? -1 : Number(organizationId) }, { organization_id: String(organizationId) }] },
      });
      if (org) where.organization_id = org.id;
    }

    return await client.organizationInvitation.findMany({
      where,
      include: { organization: true, history: true },
      orderBy: { created_at: 'desc' },
      take: Number(limit),
    });
  }
}

module.exports = InvitationService;
