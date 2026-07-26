/**
 * PlatformConfigurationService.js
 * Global Platform Settings, System Defaults & Configuration Snapshots (Phase 11.3).
 */

const defaultPrisma = require('../utils/prismaClient');

const DEFAULT_PLATFORM_SETTINGS = [
  { key: 'platform.name', value: 'VerifyChain Enterprise Platform', category: 'GLOBAL' },
  { key: 'platform.timezone', value: 'Asia/Kolkata', category: 'REGIONAL' },
  { key: 'platform.language', value: 'en', category: 'REGIONAL' },
  { key: 'platform.currency', value: 'INR', category: 'REGIONAL' },
  { key: 'security.session_timeout_mins', value: 60, category: 'SECURITY' },
  { key: 'security.mfa_required', value: false, category: 'SECURITY' },
  { key: 'storage.max_upload_size_mb', value: 100, category: 'STORAGE' },
  { key: 'storage.max_org_quota_mb', value: 50000, category: 'STORAGE' },
  { key: 'system.maintenance_mode', value: false, category: 'SYSTEM' },
  { key: 'system.announcement_banner', value: 'Welcome to VerifyChain Enterprise Operations Center', category: 'SYSTEM' },
];

class PlatformConfigurationService {
  /**
   * Seed Default Global Platform Settings
   */
  static async seedDefaultSettings(client = defaultPrisma) {
    const seeded = [];
    for (const s of DEFAULT_PLATFORM_SETTINGS) {
      const setting = await client.platformSetting.upsert({
        where: { key: s.key },
        update: { value_json: s.value, category: s.category },
        create: { key: s.key, value_json: s.value, category: s.category },
      });
      seeded.push(setting);
    }
    return seeded;
  }

  /**
   * Get Platform Setting by Key
   */
  static async getSetting(key, defaultValue = null, client = defaultPrisma) {
    const setting = await client.platformSetting.findUnique({ where: { key } });
    if (!setting) return defaultValue;
    return setting.value_json;
  }

  /**
   * Update Platform Setting & Create Configuration Snapshot
   */
  static async updateSetting({ key, value, category = 'GLOBAL', isSecret = false, updatedBy = 'ADMIN', reason = null }, client = defaultPrisma) {
    const prevSetting = await client.platformSetting.findUnique({ where: { key } });

    const updated = await client.platformSetting.upsert({
      where: { key },
      update: {
        value_json: value,
        category,
        is_secret: isSecret,
        updated_by: String(updatedBy),
      },
      create: {
        key,
        value_json: value,
        category,
        is_secret: isSecret,
        updated_by: String(updatedBy),
      },
    });

    // Create immutable configuration snapshot
    await client.configurationSnapshot.create({
      data: {
        changes_json: {
          key,
          previousValue: prevSetting ? prevSetting.value_json : null,
          newValue: value,
          category,
        },
        reason: reason || `Updated platform setting '${key}'`,
        created_by: String(updatedBy),
      },
    });

    return updated;
  }

  /**
   * List All Platform Settings grouped by category
   */
  static async listSettings(category = null, client = defaultPrisma) {
    await this.seedDefaultSettings(client);

    const where = {};
    if (category && category !== 'ALL') where.category = category.toUpperCase();

    const settings = await client.platformSetting.findMany({
      where,
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });

    // Mask secrets before returning
    return settings.map(s => {
      if (s.is_secret) {
        return { ...s, value_json: '********' };
      }
      return s;
    });
  }
}

module.exports = PlatformConfigurationService;
