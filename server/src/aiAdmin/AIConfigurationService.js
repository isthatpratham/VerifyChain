/**
 * AIConfigurationService.js
 * Default AI Platform Parameters & Governance Settings (Phase 11.4).
 */

const defaultPrisma = require('../utils/prismaClient');

const DEFAULT_AI_CONFIGS = [
  { key: 'ai.default_provider', value: 'GEMINI', category: 'GENERAL' },
  { key: 'ai.default_model', value: 'gemini-1.5-pro', category: 'GENERAL' },
  { key: 'ai.default_temperature', value: 0.2, category: 'GOVERNANCE' },
  { key: 'ai.default_timeout_ms', value: 30000, category: 'PERFORMANCE' },
  { key: 'ai.retry_attempts', value: 3, category: 'PERFORMANCE' },
  { key: 'ai.streaming_enabled', value: true, category: 'GENERAL' },
  { key: 'ai.structured_output_enabled', value: true, category: 'GENERAL' },
];

class AIConfigurationService {
  /**
   * Seed Default AI Platform Configurations
   */
  static async seedConfigs(client = defaultPrisma) {
    const seeded = [];
    for (const c of DEFAULT_AI_CONFIGS) {
      const config = await client.aIAdminConfig.upsert({
        where: { key: c.key },
        update: { value_json: c.value, category: c.category },
        create: { key: c.key, value_json: c.value, category: c.category },
      });
      seeded.push(config);
    }
    return seeded;
  }

  /**
   * Update AI Platform Configuration Parameter
   */
  static async updateConfig({ key, value, category = 'GENERAL', updatedBy = 'ADMIN' }, client = defaultPrisma) {
    return await client.aIAdminConfig.upsert({
      where: { key },
      update: {
        value_json: value,
        category,
        updated_by: String(updatedBy),
      },
      create: {
        key,
        value_json: value,
        category,
        updated_by: String(updatedBy),
      },
    });
  }

  /**
   * List AI Platform Configurations
   */
  static async listConfigs(category = null, client = defaultPrisma) {
    await this.seedConfigs(client);

    const where = {};
    if (category && category !== 'ALL') where.category = category.toUpperCase();

    return await client.aIAdminConfig.findMany({
      where,
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });
  }
}

module.exports = AIConfigurationService;
