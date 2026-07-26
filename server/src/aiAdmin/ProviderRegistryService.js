/**
 * ProviderRegistryService.js
 * Provider-Agnostic AI Provider Registry (Phase 11.4).
 */

const defaultPrisma = require('../utils/prismaClient');

const STANDARD_PROVIDERS = [
  { key: 'GEMINI', name: 'Google Gemini AI Engine', priority: 1, status: 'ACTIVE', capabilities: ['text', 'vision', 'structured_output', 'streaming', 'long_context'] },
  { key: 'OPENAI', name: 'OpenAI GPT Platform', priority: 2, status: 'ACTIVE', capabilities: ['text', 'vision', 'structured_output', 'streaming'] },
  { key: 'ANTHROPIC', name: 'Anthropic Claude Platform', priority: 3, status: 'ACTIVE', capabilities: ['text', 'vision', 'streaming', 'long_context'] },
  { key: 'AZURE_OPENAI', name: 'Azure OpenAI Enterprise', priority: 4, status: 'ACTIVE', capabilities: ['text', 'enterprise_security', 'structured_output'] },
  { key: 'OLLAMA', name: 'Ollama Local Private AI', priority: 5, status: 'ACTIVE', capabilities: ['local', 'privacy', 'offline'] },
  { key: 'MOCK', name: 'VerifyChain Mock AI Engine', priority: 6, status: 'ACTIVE', capabilities: ['mock', 'testing'] },
];

class ProviderRegistryService {
  /**
   * Seed Standard AI Providers
   */
  static async seedProviders(client = defaultPrisma) {
    const seeded = [];
    for (const p of STANDARD_PROVIDERS) {
      const provider = await client.aIAdminProvider.upsert({
        where: { key: p.key },
        update: { name: p.name, priority: p.priority, capabilities_json: p.capabilities },
        create: {
          key: p.key,
          name: p.name,
          priority: p.priority,
          status: p.status,
          capabilities_json: p.capabilities,
        },
      });
      seeded.push(provider);
    }
    return seeded;
  }

  /**
   * List Registered AI Providers
   */
  static async listProviders(client = defaultPrisma) {
    await this.seedProviders(client);
    return await client.aIAdminProvider.findMany({
      include: { models: true },
      orderBy: { priority: 'asc' },
    });
  }

  /**
   * Update Provider Status or Priority
   */
  static async updateProvider({ key, status, priority }, client = defaultPrisma) {
    const keyUpper = key.toUpperCase();
    return await client.aIAdminProvider.update({
      where: { key: keyUpper },
      data: {
        status: status ? status.toUpperCase() : undefined,
        priority: priority !== undefined ? Number(priority) : undefined,
      },
    });
  }
}

module.exports = ProviderRegistryService;
