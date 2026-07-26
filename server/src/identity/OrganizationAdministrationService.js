/**
 * OrganizationAdministrationService.js
 * Admin-level Organization Settings, Storage Quotas & Defaults Configuration (Phase 11.1).
 */

const defaultPrisma = require('../utils/prismaClient');

class OrganizationAdministrationService {
  /**
   * Update Organization Administrative Details & Quotas
   */
  static async updateOrganization(organizationId, updateData, client = defaultPrisma) {
    const org = await client.platformOrganization.findFirst({
      where: { OR: [{ id: isNaN(Number(organizationId)) ? -1 : Number(organizationId) }, { organization_id: String(organizationId) }] },
    });

    if (!org) throw new Error(`Organization '${organizationId}' not found.`);

    const updated = await client.platformOrganization.update({
      where: { id: org.id },
      data: {
        name: updateData.name || org.name,
        legal_name: updateData.legalName !== undefined ? updateData.legalName : org.legal_name,
        subscription_tier: updateData.subscriptionTier || org.subscription_tier,
        storage_quota_mb: updateData.storageQuotaMb !== undefined ? Number(updateData.storageQuotaMb) : org.storage_quota_mb,
        branding_logo_url: updateData.brandingLogoUrl !== undefined ? updateData.brandingLogoUrl : org.branding_logo_url,
        primary_contact_email: updateData.primaryContactEmail !== undefined ? updateData.primaryContactEmail : org.primary_contact_email,
        timezone: updateData.timezone || org.timezone,
        language: updateData.language || org.language,
        settings_json: updateData.settings !== undefined ? updateData.settings : org.settings_json,
        metadata_json: updateData.metadata !== undefined ? updateData.metadata : org.metadata_json,
      },
    });

    if (updateData.settings) {
      await client.organizationSettings.upsert({
        where: { organization_id: org.id },
        update: {
          timezone: updateData.timezone || org.timezone,
          language: updateData.language || org.language,
          compliance_defaults: updateData.settings.complianceDefaults || undefined,
          notification_defaults: updateData.settings.notificationDefaults || undefined,
          security_defaults: updateData.settings.securityDefaults || undefined,
        },
        create: {
          organization_id: org.id,
          timezone: updateData.timezone || 'Asia/Kolkata',
          language: updateData.language || 'en',
          compliance_defaults: updateData.settings.complianceDefaults || {},
          notification_defaults: updateData.settings.notificationDefaults || {},
          security_defaults: updateData.settings.securityDefaults || {},
        },
      });
    }

    return updated;
  }
}

module.exports = OrganizationAdministrationService;
