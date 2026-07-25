/**
 * VaultPermissionService.js
 * Permission Engine for Enterprise Document Vault.
 * Enforces multi-tenant organization isolation, RBAC, and fine-grained scope permissions.
 */

class VaultPermissionService {
  /**
   * Validate Access Permission for Vault Asset
   */
  static validateAccess({ user, requestedAction = 'READ', asset }) {
    if (!user) {
      return { allowed: false, reason: 'UNAUTHENTICATED' };
    }

    // System/Admin superuser bypass
    if (user.role === 'ADMIN') {
      return { allowed: true };
    }

    // Multi-tenant organization boundary check
    if (asset && asset.msmeId && user.msmeId && parseInt(asset.msmeId, 10) !== parseInt(user.msmeId, 10)) {
      return { allowed: false, reason: 'ORGANIZATION_MISMATCH' };
    }

    // Action permission mapping
    switch (requestedAction.toUpperCase()) {
      case 'READ':
      case 'DOWNLOAD':
      case 'VIEW':
        return { allowed: true };

      case 'UPLOAD':
      case 'CREATE':
        return { allowed: user.role === 'MSME_OWNER' || user.role === 'ADMIN' };

      case 'UPDATE':
      case 'ARCHIVE':
      case 'RESTORE':
        return { allowed: user.role === 'MSME_OWNER' || user.role === 'ADMIN' };

      case 'DELETE':
        return { allowed: user.role === 'MSME_OWNER' || user.role === 'ADMIN' };

      default:
        return { allowed: true };
    }
  }
}

module.exports = VaultPermissionService;
