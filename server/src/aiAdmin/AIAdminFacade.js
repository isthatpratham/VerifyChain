/**
 * AIAdminFacade.js
 * Unified AI Administration & Governance Facade (Phase 11.4).
 */

const ProviderRegistryService = require('./ProviderRegistryService');
const ModelRegistryService = require('./ModelRegistryService');
const PromptRegistryService = require('./PromptRegistryService');
const PromptVersionService = require('./PromptVersionService');
const QuotaService = require('./QuotaService');
const AIPolicyEngine = require('./AIPolicyEngine');
const AIConfigurationService = require('./AIConfigurationService');
const AIAuditService = require('./AIAuditService');
const AIAdministrationService = require('./AIAdministrationService');

class AIAdminFacade {
  // ─── DASHBOARD ──────────────────────────────────────────────────────────
  static async getAIDashboardStats() { return await AIAdministrationService.getAIDashboardStats(); }

  // ─── PROVIDER REGISTRY ───────────────────────────────────────────────────
  static async listProviders() { return await ProviderRegistryService.listProviders(); }
  static async updateProvider(params) { return await ProviderRegistryService.updateProvider(params); }

  // ─── MODEL REGISTRY ──────────────────────────────────────────────────────
  static async listModels() { return await ModelRegistryService.listModels(); }

  // ─── PROMPT LIBRARY & VERSIONS ───────────────────────────────────────────
  static async listPrompts(category) { return await PromptRegistryService.listPrompts(category); }
  static async createPrompt(params) { return await PromptRegistryService.createPrompt(params); }
  static async createNewVersion(params) { return await PromptVersionService.createNewVersion(params); }
  static async rollbackPrompt(promptId, targetVersion, rollbackBy) { return await PromptVersionService.rollbackPrompt(promptId, targetVersion, rollbackBy); }

  // ─── QUOTAS & POLICIES ───────────────────────────────────────────────────
  static async listQuotas(scopeType) { return await QuotaService.listQuotas(scopeType); }
  static async setQuota(params) { return await QuotaService.setQuota(params); }
  static async listPolicies() { return await AIPolicyEngine.listPolicies(); }
  static async updatePolicy(params) { return await AIPolicyEngine.updatePolicy(params); }

  // ─── CONFIGURATION & AUDITING ─────────────────────────────────────────────
  static async listConfigs(category) { return await AIConfigurationService.listConfigs(category); }
  static async updateConfig(params) { return await AIConfigurationService.updateConfig(params); }
  static async logEvent(params) { return await AIAuditService.logEvent(params); }
  static async listEvents(limit) { return await AIAuditService.listEvents(limit); }
}

module.exports = AIAdminFacade;
