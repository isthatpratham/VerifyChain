const recommendationEngine = require('./RecommendationEngine');
const riskAnalysisEngine = require('./RiskAnalysisEngine');
const strengthWeaknessEngine = require('./StrengthWeaknessEngine');
const healthSummaryEngine = require('./HealthSummaryEngine');

const msmeProfileRepository = require('../repositories/msmeProfile.repository');
const complianceRecordRepository = require('../repositories/complianceRecord.repository');
const healthIntelligenceService = require('../services/healthIntelligence.service');
const domainEventBus = require('../events/DomainEventBus');

class HealthIntelligenceFacade {
  constructor() {
    // Listen for score calculation events to trigger background insights generation
    domainEventBus.subscribe(domainEventBus.EVENTS.SCORE_CALCULATED, async (event) => {
      if (event.payload?.msmeId) {
        try {
          await this.generateFullIntelligence(event.payload.msmeId);
        } catch (err) {
          console.error(`[HealthIntelligenceFacade] Error generating background insights for MSME ${event.payload.msmeId}:`, err);
        }
      }
    });
  }

  /**
   * Generate full deterministic health intelligence for an MSME
   */
  async generateFullIntelligence(msmeId) {
    const profile = await msmeProfileRepository.findById(msmeId);
    if (!profile) throw new Error(`MSME Profile not found for ID ${msmeId}`);

    const records = await complianceRecordRepository.findByMsmeId(msmeId);
    const scoreSnapshot = await healthIntelligenceService.getCurrentScore(msmeId);

    const overallScore = scoreSnapshot.overall_score !== undefined ? scoreSnapshot.overall_score : (scoreSnapshot.overallScore || 0);
    const breakdown = scoreSnapshot.category_breakdown || scoreSnapshot.categoryBreakdown || {};

    // 1. Risk Analysis
    const riskAnalysis = riskAnalysisEngine.analyzeRisk(records, overallScore);

    // 2. Strengths & Weaknesses Analysis
    const strengthsWeaknesses = strengthWeaknessEngine.analyze(records, breakdown);

    // 3. Recommendations Engine
    const recommendations = recommendationEngine.generateRecommendations(records, scoreSnapshot);

    // 4. Executive Summary Engine
    const summary = healthSummaryEngine.generateExecutiveSummary(overallScore, riskAnalysis, strengthsWeaknesses, recommendations);

    const evaluatedAt = new Date().toISOString();

    // 5. Fire Domain Events
    domainEventBus.publish('HealthInsightsGenerated', { msmeId, evaluatedAt });
    domainEventBus.publish('RecommendationsGenerated', { msmeId, count: recommendations.length });
    domainEventBus.publish('RiskAnalysisCompleted', { msmeId, riskLevel: riskAnalysis.overallRiskLevel });
    domainEventBus.publish('HealthSummaryGenerated', { msmeId, healthText: summary.overallHealthText });

    return {
      msmeId,
      overallScore,
      evaluatedAt,
      scoreBreakdown: {
        overallScore,
        categoryBreakdown: breakdown,
        explanation: scoreSnapshot.recommendations_snapshot?.explanation || scoreSnapshot.explanation,
      },
      riskAnalysis,
      strengths: strengthsWeaknesses.strengths,
      weaknesses: strengthsWeaknesses.weaknesses,
      recommendations,
      summary,
    };
  }
}

module.exports = new HealthIntelligenceFacade();
