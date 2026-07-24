/**
 * TrustDecisionEngine.js
 * Verification decision and evidence aggregation engine.
 */

class TrustDecisionEngine {
  generateDecision(policyResult = {}, msmeProfile = {}, healthSnapshot = {}) {
    const { trustLevel, verificationState, policyRulesMatched = [] } = policyResult;

    let decision = 'APPROVED';
    if (verificationState === 'SUSPENDED' || trustLevel === 'REVOKED') {
      decision = 'REJECTED';
    } else if (verificationState === 'UNDER_REVIEW' || trustLevel === 'PENDING') {
      decision = 'UNDER_REVIEW';
    }

    // Confidence Calculation
    let confidence = 60;
    if (msmeProfile.gstin) confidence += 20;
    if (msmeProfile.udyam_number) confidence += 20;
    confidence = Math.min(100, confidence);

    const overallScore = healthSnapshot.overall_score !== undefined ? healthSnapshot.overall_score : (healthSnapshot.overallScore || 0);

    const evidenceSummary = {
      gstin: msmeProfile.gstin || 'NOT_FOUND',
      udyamNumber: msmeProfile.udyam_number || 'NOT_FOUND',
      healthScore: overallScore,
      riskLevel: healthSnapshot.risk_level || healthSnapshot.riskLevel || 'LOW',
      overdueFilingsCount: policyResult.overdueCount || 0,
    };

    const explanation = `Supplier Trust Evaluation resulted in '${decision}' with Trust Level '${trustLevel}'. ${policyRulesMatched.join(' ')}`;

    return {
      decision,
      trustLevel,
      verificationState,
      confidence,
      evidenceSummary,
      explanation,
    };
  }
}

module.exports = new TrustDecisionEngine();
