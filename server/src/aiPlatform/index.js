/**
 * index.js (aiPlatform)
 * Public API Interface for the VerifyChain AI Platform Bounded Context.
 */

const aiServiceFacade = require('./application/AIServiceFacade');
const providerFactory = require('./providers/ProviderFactory');
const modelRegistry = require('./registry/ModelRegistry');
const promptOrchestrator = require('./prompt/PromptOrchestrator');
const aiContextBuilder = require('./context/AIContextBuilder');
const memoryManager = require('./memory/MemoryManager');
const tokenAccountingService = require('./accounting/TokenAccountingService');
const aiAuditService = require('./audit/AIAuditService');
const aiPlatformConfig = require('./config/AIPlatformConfig');
const aiGovernanceFacade = require('./governance/AIGovernanceFacade');

module.exports = {
  AIService: aiServiceFacade,
  ProviderFactory: providerFactory,
  ModelRegistry: modelRegistry,
  PromptOrchestrator: promptOrchestrator,
  AIContextBuilder: aiContextBuilder,
  MemoryManager: memoryManager,
  TokenAccountingService: tokenAccountingService,
  AIAuditService: aiAuditService,
  AIPlatformConfig: aiPlatformConfig,
  AIGovernance: aiGovernanceFacade,
};
