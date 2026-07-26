/**
 * BrandingManager.js
 * Platform Branding, Colors, Logo & White-Label Customization (Phase 11.3).
 */

const defaultPrisma = require('../utils/prismaClient');

class BrandingManager {
  /**
   * Get Active Branding Configuration
   */
  static async getBranding(client = defaultPrisma) {
    const branding = await client.brandingConfig.findFirst({
      where: { is_active: true },
      orderBy: { updated_at: 'desc' },
    });

    if (branding) return branding;

    return await client.brandingConfig.create({
      data: {
        platform_name: 'VerifyChain Enterprise',
        primary_color: '#0f172a',
        accent_color: '#4f46e5',
        support_email: 'support@verifychain.io',
      },
    });
  }

  /**
   * Update Branding Configuration
   */
  static async updateBranding(brandingData, client = defaultPrisma) {
    const active = await this.getBranding(client);

    return await client.brandingConfig.update({
      where: { id: active.id },
      data: {
        platform_name: brandingData.platformName || active.platform_name,
        primary_color: brandingData.primaryColor || active.primary_color,
        accent_color: brandingData.accentColor || active.accent_color,
        logo_url: brandingData.logoUrl !== undefined ? brandingData.logoUrl : active.logo_url,
        favicon_url: brandingData.faviconUrl !== undefined ? brandingData.faviconUrl : active.favicon_url,
        support_email: brandingData.supportEmail || active.support_email,
        support_phone: brandingData.supportPhone !== undefined ? brandingData.supportPhone : active.support_phone,
        css_custom: brandingData.cssCustom !== undefined ? brandingData.cssCustom : active.css_custom,
      },
    });
  }
}

module.BrandingManager = BrandingManager;
module.exports = BrandingManager;
