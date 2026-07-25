/**
 * DocumentIntelligenceFacade.js
 * Primary Application Facade for Document Intelligence Platform.
 * Coordinates OCR extraction, classification, field extraction, validation, fraud checks, summarization, and human workflow.
 */

const ocrProviderFactory = require('../ocr/OCRProviderFactory');
const classificationEngine = require('../engines/ClassificationEngine');
const extractionEngine = require('../engines/ExtractionEngine');
const validationEngine = require('../engines/ValidationEngine');
const fraudDetectionEngine = require('../engines/FraudDetectionEngine');
const comparisonEngine = require('../engines/ComparisonEngine');
const summarizationEngine = require('../engines/SummarizationEngine');
const approvalWorkflowEngine = require('../engines/ApprovalWorkflowEngine');
const defaultPrisma = require('../../utils/prismaClient');

class DocumentIntelligenceFacade {
  /**
   * Run full document understanding pipeline
   */
  async analyzeDocument({ msmeId = 1, fileName = 'GST_Certificate.pdf', fileBuffer = null, ocrProviderCode = 'MOCK_OCR' }) {
    const parsedMsmeId = parseInt(msmeId, 10) || 1;
    const analysisId = `DOC_ANALYSIS_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // 1. Execute OCR Extraction
    const ocrProvider = ocrProviderFactory.getProvider(ocrProviderCode);
    const ocrResult = await ocrProvider.extractText({ fileName });

    // 2. Classify Document Type & Authority
    const classification = classificationEngine.classifyDocument({ fileName, rawText: ocrResult.rawText });

    // 3. Extract Key-Value Fields & Dates
    const extractedFields = extractionEngine.extractFields({ classification, rawText: ocrResult.rawText });

    // 4. Validate Format & Completeness
    const validationResults = validationEngine.validateDocument({ fields: extractedFields, classification });

    // 5. Fraud Anomaly Detection
    const fraudIndicators = fraudDetectionEngine.detectFraud({ rawText: ocrResult.rawText, classification });

    // 6. Generate AI Summary & Key Obligations
    const summary = summarizationEngine.generateSummary({ classification, fields: extractedFields });

    // 7. Persist Document Analysis to PostgreSQL Database
    const dbRecord = await defaultPrisma.documentAnalysis.create({
      data: {
        msme_id: parsedMsmeId,
        analysis_id: analysisId,
        document_name: fileName,
        document_type: classification.documentType,
        issuing_authority: classification.issuingAuthority,
        category: classification.category,
        overall_confidence: classification.confidenceScore,
        processing_status: 'COMPLETED',
        quality_score: classification.qualityScore,
        review_status: 'PENDING_REVIEW',
      },
    });

    // Save OCR Result
    await defaultPrisma.oCRResult.create({
      data: {
        document_analysis_id: dbRecord.id,
        ocr_provider: ocrResult.providerCode,
        page_count: ocrResult.pageCount,
        raw_text: ocrResult.rawText,
        layout_blocks_json: ocrResult.layoutBlocks,
      },
    }).catch(() => {});

    // Save Classification
    await defaultPrisma.documentClassification.create({
      data: {
        document_analysis_id: dbRecord.id,
        document_type: classification.documentType,
        category: classification.category,
        issuing_authority: classification.issuingAuthority,
        quality_score: classification.qualityScore,
        confidence_score: classification.confidenceScore,
      },
    }).catch(() => {});

    // Save Extracted Fields
    for (const f of extractedFields) {
      await defaultPrisma.extractedField.create({
        data: {
          document_analysis_id: dbRecord.id,
          field_key: f.fieldKey,
          field_label: f.fieldLabel,
          field_value: f.fieldValue,
          raw_value: f.rawValue,
          confidence_score: f.confidenceScore,
          page_index: f.pageIndex,
        },
      }).catch(() => {});
    }

    // Save Validations
    for (const v of validationResults) {
      await defaultPrisma.validationResult.create({
        data: {
          document_analysis_id: dbRecord.id,
          rule_name: v.ruleName,
          status: v.status,
          message: v.message,
          severity: v.severity,
        },
      }).catch(() => {});
    }

    // Save Fraud Indicators
    for (const fi of fraudIndicators) {
      await defaultPrisma.fraudIndicator.create({
        data: {
          document_analysis_id: dbRecord.id,
          indicator_code: fi.indicatorCode,
          title: fi.title,
          description: fi.description,
          risk_severity: fi.riskSeverity,
          confidence_score: fi.confidenceScore,
        },
      }).catch(() => {});
    }

    // Save Summary
    await defaultPrisma.documentSummary.create({
      data: {
        document_analysis_id: dbRecord.id,
        executive_summary: summary.executiveSummary,
        key_obligations_json: summary.keyObligations,
        important_dates_json: summary.importantDates,
        human_readable_text: summary.humanReadableText,
      },
    }).catch(() => {});

    return {
      id: dbRecord.id,
      analysisId,
      documentName: fileName,
      classification,
      extractedFields,
      validationResults,
      fraudIndicators,
      summary,
      reviewStatus: 'PENDING_REVIEW',
      ocrResult,
    };
  }

  async getDocumentAnalyses(msmeId = 1) {
    const parsedId = parseInt(msmeId, 10) || 1;
    return defaultPrisma.documentAnalysis.findMany({
      where: { msme_id: parsedId },
      include: {
        extracted_fields: true,
        classifications: true,
        summaries: true,
        validations: true,
        fraud_indicators: true,
        approval_decisions: true,
      },
      orderBy: { created_at: 'desc' },
    }).catch(() => []);
  }

  async getDocumentById(analysisId) {
    return defaultPrisma.documentAnalysis.findUnique({
      where: { analysis_id: analysisId },
      include: {
        extracted_fields: true,
        classifications: true,
        summaries: true,
        validations: true,
        fraud_indicators: true,
        approval_decisions: true,
        ocr_results: true,
      },
    }).catch(() => null);
  }

  async processApproval(params) {
    return approvalWorkflowEngine.processApproval(params);
  }

  compareDocuments(sourceFields, targetFields) {
    return comparisonEngine.compareDocuments(sourceFields, targetFields);
  }
}

module.exports = new DocumentIntelligenceFacade();
