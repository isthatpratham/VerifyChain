/**
 * TrustPolicyEngine.js
 * Deterministic Trust Policy Engine evaluating qualification levels and policy rules:
 * ENTERPRISE_TRUSTED, HIGHLY_TRUSTED, TRUSTED, VERIFIED, PENDING, SUSPENDED.
 */

class TrustPolicyEngine {
  constructor() {
    this.DEFAULT_POLICY = {
      version: 'v1.0.0',
      minScoreEnterprise: 90,
      minScoreHighlyTrusted: 80,
      minScoreTrusted: 70,
      minScoreVerified: 50,
      maxOverdueAllowedForVerified: 0,
    };
  }

  evaluatePolicy(healthScore = 100, riskLevel = 'LOW', complianceRecords = [], policy = this.DEFAULT_POLICY) {
    const overdueRecords = complianceRecords.filter((r) => r.status === 'OVERDUE');
    const dueRecords = complianceRecords.filter((r) => r.status === 'DUE');

    let trustLevel = 'PENDING';
    let verificationState = 'SUBMITTED';
    const policyRulesMatched = [];

    if (overdueRecords.length >= 2) {
      trustLevel = 'SUSPENDED';
      verificationState = 'SUSPENDED';
      policyRulesMatched.push(`Multiple overdue statutory filings (${overdueRecords.length}) triggered SUSPENDED trust state.`);
    } else if (healthScore >= policy.minScoreEnterprise && riskLevel === 'LOW' && overdueRecords.length === 0) {
      trustLevel = 'ENTERPRISE_TRUSTED';
      verificationState = 'APPROVED';
      policyRulesMatched.push(`Health score ${healthScore} >= 90 with zero overdue items qualifies for ENTERPRISE_TRUSTED.`);
    } else if (healthScore >= policy.minScoreHighlyTrusted && riskLevel === 'LOW' && overdueRecords.length === 0) {
      trustLevel = 'HIGHLY_TRUSTED';
      verificationState = 'APPROVED';
      policyRulesMatched.push(`Health score ${healthScore} >= 80 with zero overdue items qualifies for HIGHLY_TRUSTED.`);
    } else if (healthScore >= policy.minScoreTrusted && riskLevel !== 'HIGH' && overdueRecords.length === 0) {
      trustLevel = 'TRUSTED';
      verificationState = 'APPROVED';
      policyRulesMatched.push(`Health score ${healthScore} >= 70 qualifies for TRUSTED.`);
    } else if (healthScore >= policy.minScoreVerified && overdueRecords.length === 0) {
      trustLevel = 'VERIFIED';
      verificationState = 'APPROVED';
      policyRulesMatched.push(`Health score ${healthScore} >= 50 qualifies for VERIFIED.`);
    } else {
      trustLevel = 'PENDING';
      verificationState = 'UNDER_REVIEW';
      policyRulesMatched.push(`Health score ${healthScore} or active obligations require further compliance updates.`);
    }

    return {
      trustLevel,
      verificationState,
      overdueCount: overdueRecords.length,
      dueCount: dueRecords.length,
      policyVersion: policy.version,
      policyRulesMatched,
    };
  }
}

module.exports = new TrustPolicyEngine();
