/**
 * IntentEngine.js
 * Automatic Intent Classification Engine for AI Compliance Assistant.
 * Classifies user query intent (Compliance, Document, Trust, Supplier, Risk, Audit, Profile, Help, Reports, Guidance).
 */

class IntentEngine {
  /**
   * Classify user query intent
   * @param {string} userQuery - Input text prompt
   * @returns {{ intentCode: string, category: string, confidenceScore: number, requiredTools: Array }}
   */
  classifyIntent(userQuery = '') {
    const queryLower = userQuery.toLowerCase();

    if (queryLower.includes('trust score') || queryLower.includes('badge') || queryLower.includes('why did my score change')) {
      return {
        intentCode: 'TRUST_INQUIRY',
        category: 'TRUST',
        confidenceScore: 0.98,
        requiredTools: ['getTrustScore', 'getSupplierProfile'],
      };
    }

    if (queryLower.includes('fix first') || queryLower.includes('recommendation') || queryLower.includes('gap')) {
      return {
        intentCode: 'RECOMMENDATION_EXPLANATION',
        category: 'COMPLIANCE',
        confidenceScore: 0.96,
        requiredTools: ['getComplianceGaps', 'getRecommendations'],
      };
    }

    if (queryLower.includes('risk') || queryLower.includes('highest risk')) {
      return {
        intentCode: 'RISK_ANALYSIS',
        category: 'RISK',
        confidenceScore: 0.95,
        requiredTools: ['getRiskAssessment', 'getComplianceGaps'],
      };
    }

    if (queryLower.includes('report') || queryLower.includes('board report') || queryLower.includes('audit readiness')) {
      return {
        intentCode: 'REPORT_GENERATION',
        category: 'REPORTS',
        confidenceScore: 0.97,
        requiredTools: ['generateReport', 'getExecutiveSummary'],
      };
    }

    if (queryLower.includes('document') || queryLower.includes('gst certificate') || queryLower.includes('pan') || queryLower.includes('udyam')) {
      return {
        intentCode: 'DOCUMENT_QUESTION',
        category: 'DOCUMENTS',
        confidenceScore: 0.95,
        requiredTools: ['getDocuments'],
      };
    }

    if (queryLower.includes('audit') || queryLower.includes('event') || queryLower.includes('log')) {
      return {
        intentCode: 'AUDIT_INQUIRY',
        category: 'AUDIT',
        confidenceScore: 0.94,
        requiredTools: ['getAuditEvents'],
      };
    }

    // Default Compliance Inquiry
    return {
      intentCode: 'COMPLIANCE_INQUIRY',
      category: 'COMPLIANCE',
      confidenceScore: 0.92,
      requiredTools: ['getComplianceGaps', 'getExecutiveSummary'],
    };
  }
}

module.exports = new IntentEngine();
