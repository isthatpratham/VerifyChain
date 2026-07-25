/**
 * CitationService.js
 * Grounded Citation Link & Evidence Generator.
 */

class CitationService {
  /**
   * Formulate citation references from platform tool results
   */
  generateCitations({ toolResults = {}, msmeId = 1 }) {
    const citations = [];

    if (toolResults.trust) {
      citations.push({
        sourceType: 'SUPPLIER_TRUST',
        title: 'Supplier Trust Profile Ledger',
        referenceId: `TRUST_MSME_${msmeId}`,
        url: '/supplier-trust',
        snippet: `Supplier Trust Score is ${toolResults.trust.trustScore}/100 with ${toolResults.trust.badgeLevel} badge standing.`,
      });
    }

    if (toolResults.gaps && toolResults.gaps.length > 0) {
      citations.push({
        sourceType: 'COMPLIANCE_RECORD',
        title: 'Compliance Gap Registry',
        referenceId: `GAPS_MSME_${msmeId}`,
        url: '/ai-compliance-intelligence',
        snippet: `Identified ${toolResults.gaps.length} active compliance gaps in statutory filings.`,
      });
    }

    if (toolResults.risk) {
      citations.push({
        sourceType: 'RISK_ASSESSMENT',
        title: 'Multi-Dimensional Risk Matrix',
        referenceId: `RISK_MSME_${msmeId}`,
        url: '/ai-compliance-intelligence',
        snippet: `Overall Risk Score evaluated at ${toolResults.risk.overall_risk_score || toolResults.risk.overallRiskScore || 15}/100.`,
      });
    }

    if (toolResults.documents && toolResults.documents.length > 0) {
      citations.push({
        sourceType: 'DOCUMENT',
        title: 'Verified Document Vault',
        referenceId: `DOCS_MSME_${msmeId}`,
        url: '/document-intelligence',
        snippet: `${toolResults.documents.length} statutory document(s) verified via OCR & Document Intelligence.`,
      });
    }

    return citations;
  }
}

module.exports = new CitationService();
