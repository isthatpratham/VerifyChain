/**
 * RoleService.js
 * Role Management, Custom Role Creation & Default Standard Roles Seeder (Phase 11.2).
 */

const defaultPrisma = require('../utils/prismaClient');
const { PermissionCatalog } = require('./PermissionCatalog');

const DEFAULT_ROLES = [
  { code: 'SUPER_ADMIN', name: 'Platform Super Administrator', scope: 'GLOBAL', description: 'Full system-wide administrative access' },
  { code: 'ADMIN', name: 'Platform Administrator', scope: 'ORGANIZATION', description: 'Full organization administrative privileges' },
  { code: 'COMPLIANCE_MANAGER', name: 'Compliance Manager', scope: 'ORGANIZATION', description: 'Compliance assessments, policies, and audits' },
  { code: 'COMPLIANCE_OFFICER', name: 'Compliance Officer', scope: 'ORGANIZATION', description: 'Document verification and review execution' },
  { code: 'BUSINESS_OWNER', name: 'Business Owner', scope: 'ORGANIZATION', description: 'Profile management and business records' },
  { code: 'REVIEWER', name: 'Reviewer', scope: 'RESOURCE', description: 'Review requests and comment privileges' },
  { code: 'AUDITOR', name: 'Auditor', scope: 'ORGANIZATION', description: 'Read-only access to audit logs and governance' },
  { code: 'EDITOR', name: 'Editor', scope: 'RESOURCE', description: 'Content upload and metadata editing' },
  { code: 'CONTRIBUTOR', name: 'Contributor', scope: 'RESOURCE', description: 'Upload and comment access' },
  { code: 'VIEWER', name: 'Viewer', scope: 'RESOURCE', description: 'View and download access' },
  { code: 'READ_ONLY', name: 'Read Only', scope: 'RESOURCE', description: 'Strict view-only access' },
];

class RoleService {
  /**
   * Seed Default Standard Roles and Map Base Permissions
   */
  static async seedDefaultRoles(client = defaultPrisma) {
    await PermissionCatalog.seedPermissions(client);
    const allPerms = await client.platformPermission.findMany();
    const permMap = new Map(allPerms.map(p => [p.code, p.id]));

    const seededRoles = [];
    for (const r of DEFAULT_ROLES) {
      const role = await client.platformRole.upsert({
        where: { code: r.code },
        update: {
          name: r.name,
          scope: r.scope,
          description: r.description,
        },
        create: r,
      });

      // Bind all permissions to SUPER_ADMIN and ADMIN
      if (['SUPER_ADMIN', 'ADMIN'].includes(r.code)) {
        for (const pId of permMap.values()) {
          await client.rolePermission.upsert({
            where: { role_id_permission_id: { role_id: role.id, permission_id: pId } },
            update: {},
            create: { role_id: role.id, permission_id: pId },
          });
        }
      } else if (r.code === 'VIEWER') {
        const viewerPerms = ['business.read', 'compliance.read', 'document.download', 'trust.read'];
        for (const code of viewerPerms) {
          if (permMap.has(code)) {
            await client.rolePermission.upsert({
              where: { role_id_permission_id: { role_id: role.id, permission_id: permMap.get(code) } },
              update: {},
              create: { role_id: role.id, permission_id: permMap.get(code) },
            });
          }
        }
      }

      seededRoles.push(role);
    }

    return seededRoles;
  }

  /**
   * Create Custom Organization Role
   */
  static async createCustomRole(roleData, client = defaultPrisma) {
    const code = roleData.code ? roleData.code.toUpperCase() : `CUSTOM_${Date.now()}`;
    const existing = await client.platformRole.findFirst({ where: { code } });
    if (existing) throw new Error(`Role code '${code}' already exists.`);

    const role = await client.platformRole.create({
      data: {
        code,
        name: roleData.name,
        description: roleData.description || 'Custom organization role',
        scope: roleData.scope || 'ORGANIZATION',
        parent_role_id: roleData.parentRoleId ? Number(roleData.parentRoleId) : null,
        is_custom: true,
        msme_id: roleData.msmeId ? Number(roleData.msmeId) : 1,
      },
    });

    if (roleData.permissionCodes && Array.isArray(roleData.permissionCodes)) {
      const perms = await client.platformPermission.findMany({
        where: { code: { in: roleData.permissionCodes } },
      });
      for (const p of perms) {
        await client.rolePermission.create({
          data: { role_id: role.id, permission_id: p.id },
        });
      }
    }

    return await this.getRoleById(role.id, client);
  }

  /**
   * Get Role by ID or Code with attached permissions
   */
  static async getRoleById(roleId, client = defaultPrisma) {
    const isId = !isNaN(Number(roleId));
    const role = await client.platformRole.findFirst({
      where: isId ? { id: Number(roleId) } : { code: String(roleId).toUpperCase() },
      include: {
        parent_role: true,
        role_perms: { include: { permission: true } },
      },
    });

    if (!role) throw new Error(`Platform Role '${roleId}' not found.`);
    return role;
  }

  /**
   * List Roles
   */
  static async listRoles(msmeId = null, client = defaultPrisma) {
    const where = {
      OR: [
        { is_custom: false },
        { msme_id: msmeId ? Number(msmeId) : 1 },
      ],
    };

    return await client.platformRole.findMany({
      where,
      include: { role_perms: { include: { permission: true } } },
      orderBy: { created_at: 'asc' },
    });
  }
}

module.exports = RoleService;
