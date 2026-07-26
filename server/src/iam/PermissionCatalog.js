/**
 * PermissionCatalog.js
 * Centralized Permission Registry & Default Permission Catalog for VerifyChain IAM (Phase 11.2).
 */

const defaultPrisma = require('../utils/prismaClient');

const STANDARD_PERMISSIONS = [
  // Business Domain
  { code: 'business.read', name: 'View Business Profiles', category: 'BUSINESS', description: 'Allows viewing business profile details' },
  { code: 'business.create', name: 'Create Business Profile', category: 'BUSINESS', description: 'Allows creating new business profiles' },
  { code: 'business.update', name: 'Update Business Profile', category: 'BUSINESS', description: 'Allows editing business profiles' },
  { code: 'business.delete', name: 'Delete Business Profile', category: 'BUSINESS', description: 'Allows deleting business profiles' },

  // Compliance Domain
  { code: 'compliance.read', name: 'View Compliance Records', category: 'COMPLIANCE', description: 'Allows viewing compliance score and status' },
  { code: 'compliance.execute', name: 'Execute Compliance Assessment', category: 'COMPLIANCE', description: 'Allows running compliance engines & audits' },

  // Document Vault Domain
  { code: 'document.upload', name: 'Upload Vault Document', category: 'DOCUMENT', description: 'Allows uploading document assets to vault' },
  { code: 'document.download', name: 'Download Vault Document', category: 'DOCUMENT', description: 'Allows downloading document asset binaries' },
  { code: 'document.archive', name: 'Archive Document Asset', category: 'DOCUMENT', description: 'Allows archiving document assets' },
  { code: 'document.share', name: 'Share Document Asset', category: 'DOCUMENT', description: 'Allows creating share links and collaboration' },
  { code: 'document.restore', name: 'Restore Document Asset', category: 'DOCUMENT', description: 'Allows restoring archived documents' },
  { code: 'document.retention.manage', name: 'Manage Document Retention & Legal Holds', category: 'DOCUMENT', description: 'Allows retention policy assignments and legal holds' },

  // AI Platform Domain
  { code: 'ai.use', name: 'Use Enterprise AI Platform', category: 'AI', description: 'Allows interacting with AI assistant and document intelligence' },
  { code: 'ai.configure', name: 'Configure AI Models & Governance', category: 'AI', description: 'Allows tuning AI prompts, temperature, and human approval' },

  // Trust Platform Domain
  { code: 'trust.read', name: 'View Trust Profiles', category: 'TRUST', description: 'Allows viewing supplier trust metrics' },
  { code: 'trust.publish', name: 'Publish Public Trust Profile', category: 'TRUST', description: 'Allows publishing supplier trust profiles' },

  // Identity & User Administration Domain
  { code: 'user.manage', name: 'Manage Platform Users', category: 'USER', description: 'Allows user identity provisioning, suspension, and restoration' },
  { code: 'organization.manage', name: 'Manage Platform Organizations', category: 'ORGANIZATIONS', description: 'Allows organization administration and quotas' },

  // Governance & Audit Domain
  { code: 'audit.view', name: 'View Audit Logs & Compliance Trails', category: 'AUDIT', description: 'Allows viewing system integration audit logs' },
  { code: 'settings.update', name: 'Update System Settings', category: 'SETTINGS', description: 'Allows updating organization settings' },
];

class PermissionCatalog {
  /**
   * Seed Standard Permission Catalog into Database
   */
  static async seedPermissions(client = defaultPrisma) {
    const seeded = [];
    for (const p of STANDARD_PERMISSIONS) {
      const perm = await client.platformPermission.upsert({
        where: { code: p.code },
        update: {
          name: p.name,
          category: p.category,
          description: p.description,
        },
        create: p,
      });
      seeded.push(perm);
    }
    return seeded;
  }

  /**
   * Get Catalog by Category
   */
  static async listPermissions(category = null, client = defaultPrisma) {
    const where = {};
    if (category && category !== 'ALL') where.category = category.toUpperCase();

    return await client.platformPermission.findMany({
      where,
      orderBy: [{ category: 'asc' }, { code: 'asc' }],
    });
  }
}

module.exports = { PermissionCatalog, STANDARD_PERMISSIONS };
