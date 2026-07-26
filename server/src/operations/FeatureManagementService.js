/**
 * FeatureManagementService.js
 * Enterprise Feature Flag Engine & Scoped Rollout Management (Phase 11.3).
 */

const defaultPrisma = require('../utils/prismaClient');

const DEFAULT_FEATURE_FLAGS = [
  { key: 'ai.assistant', name: 'AI Compliance Assistant', category: 'CORE', scope: 'GLOBAL', is_enabled: true, description: 'Enable enterprise AI compliance assistant' },
  { key: 'ai.predictive_analytics', name: 'Predictive Intelligence', category: 'ENTERPRISE', scope: 'SUBSCRIPTION', is_enabled: true, description: 'Enable predictive compliance analytics engine' },
  { key: 'document_vault.retention', name: 'Records Management & Legal Hold', category: 'ENTERPRISE', scope: 'ORGANIZATION', is_enabled: true, description: 'Enable legal holds and retention policies' },
  { key: 'iam.temporary_access', name: 'Time-Bound Temporary Access', category: 'CORE', scope: 'GLOBAL', is_enabled: true, description: 'Enable time-bound access grants' },
  { key: 'experimental.blockchain_notary', name: 'Blockchain Public Notarization', category: 'EXPERIMENTAL', scope: 'GLOBAL', is_enabled: false, description: 'Experimental public blockchain notarization' },
];

class FeatureManagementService {
  /**
   * Seed Default Enterprise Feature Flags
   */
  static async seedFeatureFlags(client = defaultPrisma) {
    const seeded = [];
    for (const f of DEFAULT_FEATURE_FLAGS) {
      const flag = await client.featureFlag.upsert({
        where: { key: f.key },
        update: { name: f.name, category: f.category, description: f.description },
        create: f,
      });
      seeded.push(flag);
    }
    return seeded;
  }

  /**
   * Evaluate Feature Flag Status (`isEnabled(key)`)
   */
  static async isEnabled(key, defaultValue = false, client = defaultPrisma) {
    const flag = await client.featureFlag.findUnique({ where: { key } });
    if (!flag) return defaultValue;
    return flag.is_enabled;
  }

  /**
   * Toggle or Update Feature Flag
   */
  static async updateFeatureFlag({ key, isEnabled, name, description, updatedBy = 'ADMIN' }, client = defaultPrisma) {
    const flag = await client.featureFlag.upsert({
      where: { key },
      update: {
        is_enabled: isEnabled !== undefined ? Boolean(isEnabled) : undefined,
        name: name || undefined,
        description: description || undefined,
        updated_by: String(updatedBy),
      },
      create: {
        key,
        name: name || key,
        is_enabled: isEnabled !== false,
        description: description || 'Feature flag',
        updated_by: String(updatedBy),
      },
    });

    await client.configurationSnapshot.create({
      data: {
        changes_json: { key, isEnabled: flag.is_enabled },
        reason: `Feature flag '${key}' set to ${flag.is_enabled ? 'ENABLED' : 'DISABLED'}`,
        created_by: String(updatedBy),
      },
    });

    return flag;
  }

  /**
   * List All Feature Flags
   */
  static async listFeatureFlags(category = null, client = defaultPrisma) {
    await this.seedFeatureFlags(client);

    const where = {};
    if (category && category !== 'ALL') where.category = category.toUpperCase();

    return await client.featureFlag.findMany({
      where,
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });
  }
}

module.exports = FeatureManagementService;
