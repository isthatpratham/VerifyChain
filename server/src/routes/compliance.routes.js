const express = require('express');
const router = express.Router();
const complianceController = require('../controllers/compliance.controller');
const rulesEngineController = require('../controllers/rulesEngine.controller');
const orchestrationController = require('../controllers/orchestration.controller');
const healthIntelligenceController = require('../controllers/healthIntelligence.controller');
const { authenticate } = require('../middleware/auth.middleware');
const {
  createComplianceValidationRules,
  updateComplianceValidationRules,
  listComplianceValidationRules,
  validate,
} = require('../middleware/complianceValidation.middleware');

// All compliance routes require JWT authentication
router.use(authenticate);

// Health Intelligence & Scoring Engine Endpoints
router.post('/health/calculate', healthIntelligenceController.calculateScore);
router.get('/health/current', healthIntelligenceController.getCurrentScore);
router.get('/health/breakdown', healthIntelligenceController.getCategoryBreakdown);

// Insights Engine Endpoints
router.get('/health/insights', healthIntelligenceController.getFullIntelligence);
router.get('/health/insights/risk', healthIntelligenceController.getRiskAnalysis);
router.get('/health/insights/strengths-weaknesses', healthIntelligenceController.getStrengthsWeaknesses);
router.get('/health/insights/recommendations', healthIntelligenceController.getRecommendations);
router.get('/health/insights/summary', healthIntelligenceController.getExecutiveSummary);

// Automation & Event Orchestration Endpoints
router.post('/health/automation/re-evaluate', healthIntelligenceController.triggerAutomationRecalculation);
router.get('/health/automation/dependency-graph', healthIntelligenceController.getDependencyGraph);
router.get('/health/automation/metrics', healthIntelligenceController.getAutomationMetrics);

router.get('/health/config', healthIntelligenceController.getConfig);
router.get('/health/categories', healthIntelligenceController.getCategories);
router.get('/health/snapshots', healthIntelligenceController.getSnapshots);
router.get('/health/metadata', healthIntelligenceController.getMetadata);

// Orchestration Layer Endpoints
router.post('/orchestrate/sync', orchestrationController.syncCompliance);
router.post('/orchestrate/recalculate', orchestrationController.recalculateCompliance);
router.get('/orchestrate/status', orchestrationController.getOrchestrationStatus);

// Rules Engine Endpoints
router.post('/rules/evaluate', rulesEngineController.evaluateRules);
router.get('/rules/explain', rulesEngineController.explainDecision);
router.post('/rules/preview', rulesEngineController.previewEvaluation);
router.get('/rules/history', rulesEngineController.getAuditHistory);

// Compliance Records Endpoints
router.get('/', listComplianceValidationRules, validate, complianceController.getRecords);
router.get('/:id', complianceController.getRecordById);
router.post('/', createComplianceValidationRules, validate, complianceController.createRecord);
router.patch('/:id', updateComplianceValidationRules, validate, complianceController.updateRecord);
router.delete('/:id', complianceController.deleteRecord);

module.exports = router;
