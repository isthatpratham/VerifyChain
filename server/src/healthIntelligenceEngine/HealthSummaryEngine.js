/**
 * HealthSummaryEngine.js
 * Executive health summary generator.
 */

class HealthSummaryEngine {
  generateExecutiveSummary(overallScore, riskAnalysis, strengthsWeaknesses, recommendations) {
    let overallHealthText = 'EXCELLENT';
    if (overallScore < 60) overallHealthText = 'NEEDS_ATTENTION';
    else if (overallScore < 85) overallHealthText = 'MODERATE';

    const topPriorities = recommendations.slice(0, 3).map((r) => r.title);
    const majorStrengths = strengthsWeaknesses.strengths.map((s) => s.title);
    const majorRisks = strengthsWeaknesses.weaknesses.map((w) => w.title);

    return {
      overallHealthText,
      score: overallScore,
      riskLevel: riskAnalysis.overallRiskLevel,
      topPriorities,
      majorStrengths,
      majorRisks,
      summaryText: `Enterprise compliance health is ${overallHealthText} with a score of ${overallScore}/100. ${
        topPriorities.length > 0 ? `Top action priority: ${topPriorities[0]}.` : 'All statutory obligations up to date.'
      }`,
    };
  }
}

module.exports = new HealthSummaryEngine();
