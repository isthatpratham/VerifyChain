/**
 * index.js (aiAssistant)
 * Master Public API for Phase 9.4 AI Compliance Assistant Bounded Context.
 */

const aiAssistantFacade = require('./application/AIAssistantFacade');
const intentEngine = require('./engines/IntentEngine');
const toolOrchestrator = require('./engines/ToolOrchestrator');
const citationService = require('./engines/CitationService');
const groundingService = require('./engines/GroundingService');
const reportGenerator = require('./engines/ReportGenerator');
const conversationMemoryService = require('./engines/ConversationMemoryService');
const safetyLayer = require('./engines/SafetyLayer');

module.exports = {
  AIAssistant: aiAssistantFacade,
  IntentEngine: intentEngine,
  ToolOrchestrator: toolOrchestrator,
  CitationService: citationService,
  GroundingService: groundingService,
  ReportGenerator: reportGenerator,
  ConversationMemoryService: conversationMemoryService,
  SafetyLayer: safetyLayer,
};
