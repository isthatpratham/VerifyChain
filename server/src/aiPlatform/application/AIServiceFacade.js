/**
 * AIServiceFacade.js
 * Primary Application Facade for the AI Platform.
 * Business modules invoke methods on this facade instead of accessing providers directly.
 */

const promptOrchestrator = require('../prompt/PromptOrchestrator');
const aiContextBuilder = require('../context/AIContextBuilder');
const providerFactory = require('../providers/ProviderFactory');
const modelRegistry = require('../registry/ModelRegistry');
const tokenAccountingService = require('../accounting/TokenAccountingService');
const aiAuditService = require('../audit/AIAuditService');
const memoryManager = require('../memory/MemoryManager');
const aiPlatformConfig = require('../config/AIPlatformConfig');

class AIServiceFacade {
  /**
   * Execute a structured AI prompt template
   */
  async executePrompt({
    templateCode,
    version = 1,
    variables = {},
    msmeId = 1,
    userId = 'SYSTEM',
    domains = ['BUSINESS', 'COMPLIANCE', 'TRUST'],
    providerCode = null,
    modelCode = null,
  }) {
    const startTime = Date.now();
    const config = aiPlatformConfig.getConfig();
    const targetProvider = providerCode || config.defaultProvider;
    const targetModel = modelCode || config.defaultModel;
    const correlationId = `corr_ai_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 1. Build permission-aware unified context
    const context = await aiContextBuilder.buildUnifiedContext({ msmeId, userId, domains });

    try {
      // 2. Orchestrate prompt & provider execution
      const response = await promptOrchestrator.executePrompt({
        templateCode,
        version,
        variables,
        context,
        providerCode: targetProvider,
        modelCode: targetModel,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        maxRetries: config.maxRetries,
      });

      // 3. Log token accounting & audit telemetry
      if (config.featureFlags.tokenAccounting) {
        await tokenAccountingService.logUsage({
          msmeId,
          userId,
          templateCode,
          templateVersion: version,
          providerCode: response.providerCode,
          modelCode: response.modelCode,
          promptTokens: response.promptTokens,
          completionTokens: response.completionTokens,
          totalTokens: response.totalTokens,
          estimatedCost: response.estimatedCost,
          latencyMs: response.latencyMs,
          status: 'SUCCESS',
          correlationId,
        }).catch(() => {});
      }

      if (config.featureFlags.aiAuditing) {
        await aiAuditService.auditInteraction({
          msmeId,
          userId,
          templateCode,
          version,
          providerCode: response.providerCode,
          modelCode: response.modelCode,
          promptTokens: response.promptTokens,
          completionTokens: response.completionTokens,
          totalTokens: response.totalTokens,
          estimatedCost: response.estimatedCost,
          latencyMs: response.latencyMs,
          status: 'SUCCESS',
          correlationId,
        }).catch(() => {});
      }

      return response;
    } catch (err) {
      const latencyMs = Date.now() - startTime;

      await tokenAccountingService.logUsage({
        msmeId,
        userId,
        templateCode,
        templateVersion: version,
        providerCode: targetProvider,
        modelCode: targetModel,
        status: 'FAILURE',
        errorMessage: err.message,
        latencyMs,
        correlationId,
      }).catch(() => {});

      await aiAuditService.auditInteraction({
        msmeId,
        userId,
        templateCode,
        version,
        providerCode: targetProvider,
        modelCode: targetModel,
        status: 'FAILURE',
        error: err,
        latencyMs,
        correlationId,
      }).catch(() => {});

      throw err;
    }
  }

  /**
   * Build AI context
   */
  async buildContext(params) {
    return aiContextBuilder.buildUnifiedContext(params);
  }

  /**
   * Get Model Registry details
   */
  async getModelRegistry() {
    return modelRegistry.listModels();
  }

  /**
   * Get Provider status
   */
  getProviders() {
    return providerFactory.listProviders();
  }

  /**
   * Get usage analytics
   */
  async getUsageAnalytics(params) {
    return tokenAccountingService.getUsageAnalytics(params);
  }

  /**
   * Get AI audit logs
   */
  async getAuditLogs(params) {
    return aiAuditService.getAuditLogs(params);
  }

  /**
   * Manage AI memory
   */
  getMemoryManager() {
    return memoryManager;
  }

  /**
   * Manage configuration
   */
  getConfig() {
    return aiPlatformConfig.getConfig();
  }

  updateConfig(updates) {
    return aiPlatformConfig.updateConfig(updates);
  }
}

module.exports = new AIServiceFacade();
