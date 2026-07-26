/**
 * index.js
 * Central Exporter for Enterprise AI Administration & Governance (Phase 11.4).
 */

const AIAdminFacade = require('./AIAdminFacade');
const ProviderRegistryService = require('./ProviderRegistryService');
const ModelRegistryService = require('./ModelRegistryService');
const PromptRegistryService = require('./PromptRegistryService');
const PromptVersionService = require('./PromptVersionService');
const QuotaService = require('./QuotaService');
const AIPolicyEngine = require('./AIPolicyEngine');
const AIConfigurationService = require('./AIConfigurationService');
const AIAuditService = require('./AIAuditService');
const AIAdministrationService = require('./AIAdministrationService');

module.exports = {
  AIAdminFacade,
  ProviderRegistryService,
  ModelRegistryService,
  PromptRegistryService,
  PromptVersionService,
  QuotaService,
  AIPolicyEngine,
  AIConfigurationService,
  AIAuditService,
  AIAdministrationService,
};
