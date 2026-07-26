/**
 * AIAdministrationService.js
 * Central Orchestrator & AI Operations Overview (Phase 11.4).
 */

const ProviderRegistryService = require('./ProviderRegistryService');
const ModelRegistryService = require('./ModelRegistryService');
const PromptRegistryService = require('./PromptRegistryService');
const QuotaService = require('./QuotaService');
const AIPolicyEngine = require('./AIPolicyEngine');
const AIConfigurationService = require('./AIConfigurationService');
const AIAuditService = require('./AIAuditService');
const defaultPrisma = require('../utils/prismaClient');

class AIAdministrationService {
  /**
   * Get AI Operations Center Dashboard Overview
   */
  static async getAIDashboardStats(client = defaultPrisma) {
    const [providersCount, modelsCount, promptsCount, policiesCount, quotasCount, auditEventsCount] = await Promise.all([
      client.aIAdminProvider.count(),
      client.aIAdminModel.count(),
      client.aIAdminPrompt.count(),
      client.aIAdminPolicy.count(),
      client.aIAdminQuota.count(),
      client.aIAdminAuditEvent.count(),
    ]);

    const activeProvider = await client.aIAdminProvider.findFirst({
      where: { status: 'ACTIVE' },
      orderBy: { priority: 'asc' },
    });

    const activeModel = await client.aIAdminModel.findFirst({
      where: { status: 'ACTIVE' },
    });

    return {
      providersCount,
      modelsCount,
      promptsCount,
      policiesCount,
      quotasCount,
      auditEventsCount,
      activeProvider: activeProvider ? activeProvider.name : 'Google Gemini AI Engine',
      activeModel: activeModel ? activeModel.name : 'Google Gemini 1.5 Pro',
    };
  }
}

module.exports = AIAdministrationService;
