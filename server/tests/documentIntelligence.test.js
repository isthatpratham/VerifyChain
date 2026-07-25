/**
 * documentIntelligence.test.js
 * Automated Verification Test Suite for Phase 9.3 AI Document Intelligence Platform.
 */

const assert = require('assert');
const {
  DocumentIntelligence,
  OCRProviderFactory,
  ClassificationEngine,
  ExtractionEngine,
  ValidationEngine,
  FraudDetectionEngine,
  ComparisonEngine,
  SummarizationEngine,
  ApprovalWorkflowEngine,
} = require('../src/documentIntelligence');

async function runDocumentIntelligenceTests() {
  console.log('=== STARTING AI DOCUMENT INTELLIGENCE TEST SUITE (PHASE 9.3) ===\n');

  try {
    // 1. OCR Provider Abstraction Test
    console.log('[Test 1] Testing OCR Provider Abstraction Layer...');
    const mockProvider = OCRProviderFactory.getProvider('MOCK_OCR');
    assert.ok(mockProvider, 'Mock OCR provider retrieved');
    assert.strictEqual(mockProvider.providerCode, 'MOCK_OCR');

    const ocrResult = await mockProvider.extractText({ fileName: 'GST_Certificate.pdf', documentType: 'GST_CERTIFICATE' });
    assert.ok(ocrResult.rawText, 'Raw text extracted');
    assert.strictEqual(ocrResult.providerCode, 'MOCK_OCR');
    console.log('✔ OCR Provider Abstraction Layer passed.');

    // 2. Classification Engine Test
    console.log('\n[Test 2] Testing Classification Engine...');
    const classification = ClassificationEngine.classifyDocument({ fileName: 'GST_Certificate.pdf', rawText: ocrResult.rawText });
    assert.strictEqual(classification.documentType, 'GST_CERTIFICATE');
    assert.strictEqual(classification.category, 'TAX_REGISTRATION');
    assert.ok(classification.issuingAuthority, 'Issuing authority identified');
    console.log(`✔ Classification Engine passed (Document Type: ${classification.documentType}, Authority: ${classification.issuingAuthority}).`);

    // 3. Extraction Engine Test
    console.log('\n[Test 3] Testing Field Extraction Engine...');
    const fields = ExtractionEngine.extractFields({ classification, rawText: ocrResult.rawText });
    assert.ok(fields.length >= 3, 'Extraction engine should extract key-value fields');
    assert.ok(fields.some((f) => f.fieldKey === 'gstin'), 'GSTIN field extracted');
    console.log(`✔ Field Extraction Engine passed (${fields.length} fields extracted).`);

    // 4. Validation Engine Test
    console.log('\n[Test 4] Testing Validation Engine...');
    const validations = ValidationEngine.validateDocument({ fields, classification });
    assert.ok(validations.length > 0, 'Validation rules executed');
    assert.ok(validations.some((v) => v.ruleName === 'GSTIN_FORMAT_VALIDATION' && v.status === 'PASSED'), 'GSTIN format validation passed');
    console.log('✔ Validation Engine passed.');

    // 5. Fraud Detection Engine Test
    console.log('\n[Test 5] Testing Fraud Detection Engine...');
    const fraudIndicators = FraudDetectionEngine.detectFraud({ rawText: ocrResult.rawText, classification });
    assert.ok(fraudIndicators.length > 0, 'Fraud indicators generated');
    assert.strictEqual(fraudIndicators[0].riskSeverity, 'LOW');
    console.log('✔ Fraud Detection Engine passed.');

    // 6. Summarization & Comparison Engine Test
    console.log('\n[Test 6] Testing Summarization & Comparison Engines...');
    const summary = SummarizationEngine.generateSummary({ classification, fields });
    assert.ok(summary.executiveSummary, 'Executive summary generated');
    assert.ok(summary.keyObligations.length > 0, 'Key obligations listed');

    const comparison = ComparisonEngine.compareDocuments(fields, fields);
    assert.strictEqual(comparison.similarityScore, 1.0, 'Identical document field sets yield 1.0 similarity');
    console.log('✔ Summarization & Comparison Engines passed.');

    // 7. Document Intelligence Application Facade Test
    console.log('\n[Test 7] Testing DocumentIntelligence Application Facade...');
    const analysis = await DocumentIntelligence.analyzeDocument({
      msmeId: 101,
      fileName: 'PAN_Card_VerifyChain.pdf',
      ocrProviderCode: 'MOCK_OCR',
    });

    assert.ok(analysis.analysisId, 'Analysis ID generated');
    assert.strictEqual(analysis.reviewStatus, 'PENDING_REVIEW');
    assert.ok(analysis.extractedFields.length > 0, 'Extracted fields persisted');
    console.log(`✔ DocumentIntelligence Application Facade passed (Analysis ID: ${analysis.analysisId}).`);

    // 8. Human Review Approval Workflow Test
    console.log('\n[Test 8] Testing Human Review Approval Workflow...');
    const approvalResult = await DocumentIntelligence.processApproval({
      analysisId: analysis.analysisId,
      reviewerId: 'REVIEWER_AUDITOR_1',
      decision: 'APPROVED',
      overriddenFields: { businessName: 'ACME HEAVY ENGINEERING PRIVATE LIMITED' },
      notes: 'Verified against statutory MCA portal',
    });

    assert.strictEqual(approvalResult.reviewStatus, 'APPROVED');
    assert.strictEqual(approvalResult.overriddenFieldsCount, 1);
    console.log('✔ Human Review Approval Workflow passed.');

    console.log('\n=== AI DOCUMENT INTELLIGENCE PLATFORM PASSED ALL VERIFICATIONS (PHASE 9.3) ===');
  } catch (err) {
    console.error('\n❌ AI DOCUMENT INTELLIGENCE TEST FAILED:', err);
    process.exit(1);
  }
}

runDocumentIntelligenceTests();
