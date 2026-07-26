/**
 * OrganizationService.js
 * Enterprise Organization Management Service for Platform Administration (Phase 11.1).
 */

const defaultPrisma = require('../utils/prismaClient');

class OrganizationService {
  /**
   * Create Enterprise Organization
   */
  static async createOrganization(orgData, client = defaultPrisma) {
    const slug = orgData.slug || orgData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existing = await client.platformOrganization.findFirst({
      where: { OR: [{ slug }, { name: orgData.name }] },
    });

    if (existing) {
      throw new Error(`Organization '${orgData.name}' or slug '${slug}' already exists.`);
    }

    const org = await client.platformOrganization.create({
      data: {
        name: orgData.name,
        legal_name: orgData.legalName || orgData.name,
        slug,
        subscription_tier: orgData.subscriptionTier || 'ENTERPRISE',
        storage_quota_mb: orgData.storageQuotaMb || 10240,
        branding_logo_url: orgData.brandingLogoUrl || null,
        primary_contact_email: orgData.primaryContactEmail || null,
        timezone: orgData.timezone || 'Asia/Kolkata',
        language: orgData.language || 'en',
        settings_json: orgData.settings || {},
        metadata_json: orgData.metadata || {},
      },
    });

    // Seed default Organization Settings
    await client.organizationSettings.create({
      data: {
        organization_id: org.id,
        timezone: org.timezone,
        language: org.language,
        regional_settings: { currency: 'INR', dateFormat: 'DD/MM/YYYY' },
        compliance_defaults: { autoArchiveDays: 365, strictRetention: true },
        notification_defaults: { emailDigest: 'DAILY', criticalAlerts: true },
        security_defaults: { mfaRequired: false, sessionTimeoutMins: 60 },
      },
    });

    // Log lifecycle event
    await client.organizationStatusHistory.create({
      data: {
        organization_id: org.id,
        from_status: 'NONE',
        to_status: 'ACTIVE',
        reason: 'Organization Initial Provisioning',
        changed_by: orgData.createdBy || 'ADMIN',
      },
    });

    return await this.getOrganizationById(org.id, client);
  }

  /**
   * Get Organization Details by ID or Slug
   */
  static async getOrganizationById(identifier, client = defaultPrisma) {
    const isId = !isNaN(Number(identifier));
    const org = await client.platformOrganization.findFirst({
      where: isId ? { id: Number(identifier) } : { OR: [{ organization_id: String(identifier) }, { slug: String(identifier) }] },
      include: {
        settings: true,
        memberships: {
          include: { user: { include: { user_profile: true } } },
        },
        invitations: true,
        status_history: {
          orderBy: { created_at: 'desc' },
          take: 5,
        },
      },
    });

    if (!org) {
      throw new Error(`Platform Organization '${identifier}' not found.`);
    }

    return org;
  }

  /**
   * List Organizations with filter & pagination
   */
  static async listOrganizations(filterParams = {}, client = defaultPrisma) {
    const { status, subscriptionTier, query, limit = 20, offset = 0 } = filterParams;
    const where = {};

    if (status) where.status = status;
    if (subscriptionTier) where.subscription_tier = subscriptionTier;
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { slug: { contains: query, mode: 'insensitive' } },
      ];
    }

    const [total, organizations] = await Promise.all([
      client.platformOrganization.count({ where }),
      client.platformOrganization.findMany({
        where,
        include: {
          settings: true,
          memberships: true,
        },
        orderBy: { created_at: 'desc' },
        take: Number(limit),
        skip: Number(offset),
      }),
    ]);

    return {
      total,
      limit: Number(limit),
      offset: Number(offset),
      organizations,
    };
  }
}

module.exports = OrganizationService;
