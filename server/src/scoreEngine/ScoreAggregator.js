/**
 * ScoreAggregator.js
 * Weighted score aggregator, normalizer (0-100), confidence evaluator,
 * risk level classifier, and structured explanation builder.
 */

class ScoreAggregator {
  aggregate(categoryResults = {}, penaltyBonusResult = {}, config = {}, msmeProfile = {}) {
    const categories = Object.keys(categoryResults);
    if (categories.length === 0) {
      return {
        overallScore: 0,
        riskLevel: 'HIGH',
        confidence: 0,
        explanation: 'No compliance records available to aggregate.',
      };
    }

    let weightedSum = 0;
    let totalWeight = 0;
    const categoryContributions = {};

    for (const code of categories) {
      const catRes = categoryResults[code];
      const weight = 1.0; // Standard equal weighting across categories
      weightedSum += catRes.score * weight;
      totalWeight += weight;
      categoryContributions[code] = {
        score: catRes.score,
        weight,
        contribution: parseFloat((catRes.score * weight).toFixed(2)),
      };
    }

    const baseScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
    const rawScore = baseScore - penaltyBonusResult.totalPenalties + penaltyBonusResult.totalBonuses;

    const minScore = config.min_score !== undefined ? config.min_score : 0;
    const maxScore = config.max_score !== undefined ? config.max_score : 100;

    // Clamp score strictly between minScore and maxScore
    const finalScore = Math.max(minScore, Math.min(maxScore, Math.round(rawScore)));

    // Risk Level Classification
    let riskLevel = 'LOW';
    if (finalScore < 60) riskLevel = 'HIGH';
    else if (finalScore < 85) riskLevel = 'MEDIUM';

    // Confidence Calculation (Deterministic based on completed profile fields)
    let completeness = 50;
    if (msmeProfile.gstin) completeness += 15;
    if (msmeProfile.udyam_number) completeness += 15;
    if (msmeProfile.employee_count !== undefined) completeness += 10;
    if (msmeProfile.annual_turnover_lakh !== undefined) completeness += 10;
    const confidence = Math.min(100, completeness);

    const explanation = {
      baseScore: Math.round(baseScore),
      finalScore,
      riskLevel,
      confidence,
      categoryContributions,
      penaltyReasons: penaltyBonusResult.penaltyReasons,
      bonusReasons: penaltyBonusResult.bonusReasons,
      summary: `Final score of ${finalScore}/100 with ${riskLevel} risk level. Evaluated across ${categories.length} statutory categories.`,
    };

    return {
      overallScore: finalScore,
      riskLevel,
      confidence,
      explanation,
    };
  }
}

module.exports = new ScoreAggregator();
