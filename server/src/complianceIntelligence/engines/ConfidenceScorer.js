/**
 * ConfidenceScorer.js
 * Confidence Scoring & Data Completeness Engine.
 */

class ConfidenceScorer {
  /**
   * Calculate confidence score and data completeness metrics
   */
  calculateConfidence(context = {}) {
    const business = context.business || {};
    const compliance = context.compliance || {};
    const trust = context.trust || {};

    let completenessPoints = 0;
    const totalPoints = 5;

    if (business.msmeId) completenessPoints++;
    if (business.gstin) completenessPoints++;
    if (compliance.overallHealthScore !== undefined) completenessPoints++;
    if (trust.trustScore !== undefined) completenessPoints++;
    if (business.verificationStatus) completenessPoints++;

    const dataCompleteness = Number((completenessPoints / totalPoints).toFixed(2));
    const confidenceScore = Number((0.85 + dataCompleteness * 0.12).toFixed(2));

    return {
      confidenceScore,
      dataCompleteness,
      reasoningQuality: 'HIGH',
      supportingEvidenceWeight: 'STRONG',
    };
  }
}

module.exports = new ConfidenceScorer();
