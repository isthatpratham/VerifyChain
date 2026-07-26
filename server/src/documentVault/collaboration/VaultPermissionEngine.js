/**
 * VaultPermissionEngine.js
 * Fine-Grained RBAC & Permission Inheritance Engine for Enterprise Vault (Phase 10.4).
 * Evaluates access inheritance across Organization -> Folder -> Collection -> Document -> Version.
 */

const defaultPrisma = require('../../utils/prismaClient');

const ROLE_PERMISSIONS = {
  OWNER: ['view', 'download', 'upload_version', 'edit_metadata', 'move', 'archive', 'restore', 'delete', 'comment', 'mention', 'share', 'manage_permissions', 'request_review'],
  MSME_OWNER: ['view', 'download', 'upload_version', 'edit_metadata', 'move', 'archive', 'restore', 'delete', 'comment', 'mention', 'share', 'manage_permissions', 'request_review'],
  ADMIN: ['view', 'download', 'upload_version', 'edit_metadata', 'move', 'archive', 'restore', 'delete', 'comment', 'mention', 'share', 'manage_permissions', 'request_review'],
  COMPLIANCE_MANAGER: ['view', 'download', 'upload_version', 'edit_metadata', 'archive', 'comment', 'mention', 'share', 'request_review'],
  COMPLIANCE_OFFICER: ['view', 'download', 'upload_version', 'comment', 'mention', 'request_review'],
  REVIEWER: ['view', 'download', 'comment', 'mention', 'request_review'],
  EDITOR: ['view', 'download', 'upload_version', 'edit_metadata', 'comment', 'mention'],
  CONTRIBUTOR: ['view', 'download', 'comment', 'mention'],
  VIEWER: ['view', 'download', 'comment'],
  READ_ONLY: ['view'],
};

class VaultPermissionEngine {
  /**
   * Evaluate User Access Level for a Vault Asset
   */
  static async evaluateAccess({ user, assetId, requestedAction = 'view', msmeId = 1 }, client = defaultPrisma) {
    if (!user) {
      return { allowed: false, reason: 'Unauthenticated user', accessLevel: 'NONE' };
    }

    // 1. Organization Boundary Check
    if (user.msmeId && parseInt(user.msmeId, 10) !== parseInt(msmeId, 10)) {
      return { allowed: false, reason: 'Organization boundary isolation breach', accessLevel: 'NONE' };
    }

    const role = (user.role || 'VIEWER').toUpperCase();
    const userRolePerms = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.VIEWER;

    const asset = await client.vaultAsset.findFirst({
      where: {
        OR: [
          { asset_id: assetId },
          { id: isNaN(Number(assetId)) ? -1 : Number(assetId) },
        ],
        msme_id: msmeId,
      },
      include: { shares: { where: { is_revoked: false } } },
    });

    if (!asset) {
      return { allowed: false, reason: 'Asset not found', accessLevel: 'NONE' };
    }

    // 2. Asset Owner Check
    if (asset.owner_id && parseInt(asset.owner_id, 10) === parseInt(user.id, 10)) {
      return { allowed: true, reason: 'Asset Owner', accessLevel: 'MANAGE' };
    }

    // 3. Explicit Share Grants Check
    const userShares = asset.shares.filter(s => {
      if (s.expires_at && new Date(s.expires_at) < new Date()) return false;
      if (s.target_type === 'USER' && s.target_id === String(user.id)) return true;
      if (s.target_type === 'ROLE' && s.target_id.toUpperCase() === role) return true;
      if (s.target_type === 'ORGANIZATION') return true;
      return false;
    });

    if (userShares.length > 0) {
      // Pick highest share access level
      const shareLevels = userShares.map(s => s.access_level);
      if (shareLevels.includes('MANAGE') || shareLevels.includes('EDIT')) {
        return { allowed: true, reason: 'Explicit Share Grant (Edit/Manage)', accessLevel: 'EDIT' };
      }
      if (shareLevels.includes('COMMENT') && ['view', 'download', 'comment', 'mention'].includes(requestedAction)) {
        return { allowed: true, reason: 'Explicit Share Grant (Comment)', accessLevel: 'COMMENT' };
      }
      if (shareLevels.includes('READ') && ['view', 'download'].includes(requestedAction)) {
        return { allowed: true, reason: 'Explicit Share Grant (Read)', accessLevel: 'READ' };
      }
    }

    // 4. Default RBAC Role Check
    const hasRolePerm = userRolePerms.includes(requestedAction.toLowerCase());
    return {
      allowed: hasRolePerm,
      reason: hasRolePerm ? `RBAC Role '${role}' Granted Action '${requestedAction}'` : `RBAC Role '${role}' Denied Action '${requestedAction}'`,
      accessLevel: role,
    };
  }
}

module.exports = VaultPermissionEngine;
