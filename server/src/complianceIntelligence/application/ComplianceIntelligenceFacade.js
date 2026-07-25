/**
 * ComplianceIntelligenceFacade.js
 * Primary Application Facade for Compliance Intelligence Engine.
 * Coordinates Gap Detection, Risk Analysis, Recommendation Generation, Action Planning, and Executive Summary.
 */

const { AIContextBuilder } = require('../../aiPlatform');
const gapAnalyzer = require('../engines/GapAnalyzer');
const riskAnalyzer = require('../engines/RiskAnalyzer');
const recommendationEngine = require('../engines/RecommendationEngine');
const actionPlanner = require('../engines/ActionPlanner');
const summaryGenerator = require('../engines/SummaryGenerator');
const confidenceScorer = require('../engines/ConfidenceScorer');
const explanationEngine = require('../engines/ExplanationEngine');
const defaultPrisma = require('../../utils/prismaClient');

class ComplianceIntelligenceFacade {
  /**
   * Run full compliance intelligence analysis cycle
   */
  async runFullAnalysis({ msmeId = 1, userId = 'SYSTEM' }) {
    const parsedId = parseInt(msmeId, 10) || 1;

    // 1. Build unified domain context via AIContextBuilder
    const context = await AIContextBuilder.buildUnifiedContext({
      msmeId: parsedId,
      userId,
      domains: ['ALL'],
    });

    // 2. Detect compliance & verification gaps
    const gaps = await gapAnalyzer.detectGaps(context);

    // 3. Multi-dimensional risk scoring
    const riskAssessment = await riskAnalyzer.analyzeRisk(context, gaps);

    // 4. Generate explainable recommendations
    const recommendations = await recommendationEngine.generateRecommendations(parsedId, context, gaps, riskAssessment);

    // 5. Generate remediation action plans
    const actionPlans = await actionPlanner.generateActionPlans(parsedId, gaps);

    // 6. Generate executive summary for leadership
    const executiveSummary = await summaryGenerator.generateExecutiveSummary(parsedId, context, riskAssessment, gaps);

    // 7. Calculate confidence & completeness metrics
    const confidenceReport = confidenceScorer.calculateConfidence(context);

    return {
      msmeId: parsedId,
      timestamp: new Date().toISOString(),
      executiveSummary,
      recommendations,
      complianceGaps: gaps,
      riskAssessment,
      actionPlans,
      confidenceReport,
    };
  }

  async getRecommendations(msmeId = 1) {
    const parsedId = parseInt(msmeId, 10) || 1;
    const dbRecs = await defaultPrisma.complianceRecommendation.findMany({
      where: { msme_id: parsedId, status: 'ACTIVE' },
      include: { evidences: true },
      orderBy: { created_at: 'desc' },
    }).catch(() => []);

    if (dbRecs.length > 0) return dbRecs;
    const analysis = await this.runFullAnalysis({ msmeId: parsedId });
    return analysis.recommendations;
  }

  async getRiskAssessment(msmeId = 1) {
    const parsedId = parseInt(msmeId, 10) || 1;
    const dbRisk = await defaultPrisma.riskAssessment.findUnique({
      where: { msme_id: parsedId },
      include: { factors: true },
    }).catch(() => null);

    if (dbRisk) return dbRisk;
    const analysis = await this.runFullAnalysis({ msmeId: parsedId });
    return analysis.riskAssessment;
  }

  async getExecutiveSummary(msmeId = 1) {
    const parsedId = parseInt(msmeId, 10) || 1;
    const dbSummary = await defaultPrisma.executiveSummary.findUnique({
      where: { msme_id: parsedId },
    }).catch(() => null);

    if (dbSummary) return dbSummary;
    const analysis = await this.runFullAnalysis({ msmeId: parsedId });
    return analysis.executiveSummary;
  }

  async getComplianceGaps(msmeId = 1) {
    const parsedId = parseInt(msmeId, 10) || 1;
    const dbGaps = await defaultPrisma.complianceGap.findMany({
      where: { msme_id: parsedId, is_resolved: false },
    }).catch(() => []);

    if (dbGaps.length > 0) return dbGaps;
    const analysis = await this.runFullAnalysis({ msmeId: parsedId });
    return analysis.complianceGaps;
  }

  async getActionPlans(msmeId = 1) {
    const parsedId = parseInt(msmeId, 10) || 1;
    const dbPlans = await defaultPrisma.actionPlan.findMany({
      where: { msme_id: parsedId, is_completed: false },
    }).catch(() => []);

    if (dbPlans.length > 0) return dbPlans;
    const analysis = await this.runFullAnalysis({ msmeId: parsedId });
    return analysis.actionPlans;
  }

  async updateRecommendationStatus(msmeId = 1, recommendationId, status = 'ACCEPTED', userId = 'SYSTEM') {
    const parsedId = parseInt(msmeId, 10) || 1;

    await defaultPrisma.complianceRecommendation.update({
      where: { recommendation_id: recommendationId },
      data: { status },
    }).catch(() => {});

    await defaultPrisma.recommendationHistory.create({
      data: {
        msme_id: parsedId,
        recommendation_id: recommendationId,
        user_id: userId,
        action: status,
      },
    }).catch(() => {});

    return { recommendationId, status, timestamp: new Date().toISOString() };
  }
}

module.exports = new ComplianceIntelligenceFacade();
