/**
 * index.js (complianceIntelligence)
 * Master Public API for Phase 9.2 Compliance Intelligence Engine Bounded Context.
 */

const complianceIntelligenceFacade = require('./application/ComplianceIntelligenceFacade');
const gapAnalyzer = require('./engines/GapAnalyzer');
const riskAnalyzer = require('./engines/RiskAnalyzer');
const recommendationEngine = require('./engines/RecommendationEngine');
const priorityEngine = require('./engines/PriorityEngine');
const actionPlanner = require('./engines/ActionPlanner');
const summaryGenerator = require('./engines/SummaryGenerator');
const explanationEngine = require('./engines/ExplanationEngine');
const confidenceScorer = require('./engines/ConfidenceScorer');
const guardrailsEngine = require('./engines/GuardrailsEngine');

module.exports = {
  ComplianceIntelligence: complianceIntelligenceFacade,
  GapAnalyzer: gapAnalyzer,
  RiskAnalyzer: riskAnalyzer,
  RecommendationEngine: recommendationEngine,
  PriorityEngine: priorityEngine,
  ActionPlanner: actionPlanner,
  SummaryGenerator: summaryGenerator,
  ExplanationEngine: explanationEngine,
  ConfidenceScorer: confidenceScorer,
  GuardrailsEngine: guardrailsEngine,
};
