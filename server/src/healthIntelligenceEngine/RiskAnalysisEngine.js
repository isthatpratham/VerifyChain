/**
 * RiskAnalysisEngine.js
 * Deterministic risk analysis engine categorizing risk levels, severity, impact,
 * and affected statutory compliance areas.
 */

class RiskAnalysisEngine {
  analyzeRisk(complianceRecords = [], overallScore = 100) {
    const overdueRecords = complianceRecords.filter((r) => r.status === 'OVERDUE');
    const dueRecords = complianceRecords.filter((r) => r.status === 'DUE');

    let overallRiskLevel = 'LOW';
    let severity = 'LOW';
    let recommendedAttentionLevel = 'SAFE_MAINTENANCE';

    if (overdueRecords.length >= 2 || overallScore < 60) {
      overallRiskLevel = 'HIGH';
      severity = 'CRITICAL';
      recommendedAttentionLevel = 'URGENT_ACTION_REQUIRED';
    } else if (overdueRecords.length === 1 || dueRecords.length >= 2 || overallScore < 85) {
      overallRiskLevel = 'MEDIUM';
      severity = 'MODERATE';
      recommendedAttentionLevel = 'PROACTIVE_MONITORING';
    }

    const affectedAuthorities = [...overdueRecords, ...dueRecords].map((r) => r.authority);

    const potentialImpacts = [];
    if (overdueRecords.length > 0) {
      potentialImpacts.push('Statutory interest penalties & regulatory non-compliance warnings.');
      potentialImpacts.push('Potential impairment of buyer verification trust score.');
    }
    if (dueRecords.length > 0) {
      potentialImpacts.push('Risk of score drop if filings cross expiry deadline.');
    }

    return {
      overallRiskLevel,
      severity,
      recommendedAttentionLevel,
      overdueCount: overdueRecords.length,
      dueCount: dueRecords.length,
      affectedAuthorities: Array.from(new Set(affectedAuthorities)),
      potentialImpacts,
    };
  }
}

module.exports = new RiskAnalysisEngine();
