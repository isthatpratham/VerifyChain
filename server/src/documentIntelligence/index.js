/**
 * index.js (documentIntelligence)
 * Master Public API for Phase 9.3 Document Intelligence Bounded Context.
 */

const documentIntelligenceFacade = require('./application/DocumentIntelligenceFacade');
const ocrProviderFactory = require('./ocr/OCRProviderFactory');
const classificationEngine = require('./engines/ClassificationEngine');
const extractionEngine = require('./engines/ExtractionEngine');
const validationEngine = require('./engines/ValidationEngine');
const fraudDetectionEngine = require('./engines/FraudDetectionEngine');
const comparisonEngine = require('./engines/ComparisonEngine');
const summarizationEngine = require('./engines/SummarizationEngine');
const approvalWorkflowEngine = require('./engines/ApprovalWorkflowEngine');

module.exports = {
  DocumentIntelligence: documentIntelligenceFacade,
  OCRProviderFactory: ocrProviderFactory,
  ClassificationEngine: classificationEngine,
  ExtractionEngine: extractionEngine,
  ValidationEngine: validationEngine,
  FraudDetectionEngine: fraudDetectionEngine,
  ComparisonEngine: comparisonEngine,
  SummarizationEngine: summarizationEngine,
  ApprovalWorkflowEngine: approvalWorkflowEngine,
};
