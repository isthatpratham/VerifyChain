/**
 * ModelRegistryService.js
 * Provider-Independent Model Catalog Management (Phase 11.4).
 */

const defaultPrisma = require('../utils/prismaClient');
const ProviderRegistryService = require('./ProviderRegistryService');

const STANDARD_MODELS = [
  { key: 'gemini-1.5-pro', name: 'Google Gemini 1.5 Pro', providerKey: 'GEMINI', contextWindow: 2000000, streaming: true, structured: true },
  { key: 'gpt-4o', name: 'OpenAI GPT-4o Enterprise', providerKey: 'OPENAI', contextWindow: 128000, streaming: true, structured: true },
  { key: 'claude-3-5-sonnet', name: 'Anthropic Claude 3.5 Sonnet', providerKey: 'ANTHROPIC', contextWindow: 200000, streaming: true, structured: true },
  { key: 'mock-model-v1', name: 'VerifyChain Mock Intelligence Engine', providerKey: 'MOCK', contextWindow: 64000, streaming: true, structured: true },
];

class ModelRegistryService {
  /**
   * Seed Standard Model Catalog
   */
  static async seedModels(client = defaultPrisma) {
    await ProviderRegistryService.seedProviders(client);
    const providers = await client.aIAdminProvider.findMany();
    const providerMap = new Map(providers.map(p => [p.key, p.id]));

    const seeded = [];
    for (const m of STANDARD_MODELS) {
      const pId = providerMap.get(m.providerKey);
      if (pId) {
        const model = await client.aIAdminModel.upsert({
          where: { key: m.key },
          update: {
            name: m.name,
            context_window: m.contextWindow,
            supports_streaming: m.streaming,
            supports_structured_output: m.structured,
          },
          create: {
            key: m.key,
            name: m.name,
            provider_id: pId,
            context_window: m.contextWindow,
            supports_streaming: m.streaming,
            supports_structured_output: m.structured,
          },
        });
        seeded.push(model);
      }
    }
    return seeded;
  }

  /**
   * List Registered Models
   */
  static async listModels(client = defaultPrisma) {
    await this.seedModels(client);
    return await client.aIAdminModel.findMany({
      include: { provider: true },
      orderBy: { created_at: 'asc' },
    });
  }
}

module.exports = ModelRegistryService;
