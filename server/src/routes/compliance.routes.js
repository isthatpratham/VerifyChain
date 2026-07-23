const express = require('express');
const router = express.Router();
const complianceController = require('../controllers/compliance.controller');
const rulesEngineController = require('../controllers/rulesEngine.controller');
const orchestrationController = require('../controllers/orchestration.controller');
const { authenticate } = require('../middleware/auth.middleware');
const {
  createComplianceValidationRules,
  updateComplianceValidationRules,
  listComplianceValidationRules,
  validate,
} = require('../middleware/complianceValidation.middleware');

// All compliance routes require JWT authentication
router.use(authenticate);

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
