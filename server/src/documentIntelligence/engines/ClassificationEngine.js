/**
 * ClassificationEngine.js
 * Automatic Document Type & Authority Classification Engine.
 */

class ClassificationEngine {
  /**
   * Classify document based on OCR text and file metadata
   */
  classifyDocument({ fileName = '', rawText = '' }) {
    const textUpper = rawText.toUpperCase();
    const fileUpper = fileName.toUpperCase();

    let documentType = 'GST_CERTIFICATE';
    let category = 'TAX_REGISTRATION';
    let issuingAuthority = 'GSTN Government of India';

    if (textUpper.includes('PERMANENT ACCOUNT NUMBER') || textUpper.includes('INCOME TAX') || fileUpper.includes('PAN')) {
      documentType = 'PAN';
      category = 'TAX_IDENTIFICATION';
      issuingAuthority = 'Income Tax Department Government of India';
    } else if (textUpper.includes('UDYAM') || textUpper.includes('MSME') || fileUpper.includes('UDYAM')) {
      documentType = 'UDYAM_CERTIFICATE';
      category = 'ENTERPRISE_REGISTRATION';
      issuingAuthority = 'Ministry of Micro Small & Medium Enterprises';
    } else if (textUpper.includes('FSSAI') || textUpper.includes('FOOD SAFETY')) {
      documentType = 'FSSAI_LICENSE';
      category = 'FOOD_SAFETY';
      issuingAuthority = 'Food Safety and Standards Authority of India';
    } else if (textUpper.includes('INVOICE') || textUpper.includes('BILL TO')) {
      documentType = 'COMMERCIAL_INVOICE';
      category = 'FINANCIAL_DOCUMENT';
      issuingAuthority = 'Commercial Supplier Entity';
    }

    return {
      documentType,
      category,
      issuingAuthority,
      language: 'en',
      qualityScore: 0.98,
      confidenceScore: 0.96,
      businessRelevance: 'CRITICAL_STATUTORY_RECORD',
    };
  }
}

module.exports = new ClassificationEngine();
