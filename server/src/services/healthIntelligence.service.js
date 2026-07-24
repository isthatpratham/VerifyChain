const healthScoreConfigRepository = require('../repositories/healthScoreConfig.repository');
const healthScoreSnapshotRepository = require('../repositories/healthScoreSnapshot.repository');
const scoreCategoryRepository = require('../repositories/scoreCategory.repository');
const domainEventBus = require('../events/DomainEventBus');
const { scorePipeline } = require('../scoreEngine');
const healthIntelligenceFacade = require('../healthIntelligenceEngine/HealthIntelligenceFacade');

class HealthIntelligenceService {
  /**
   * Execute deterministic score calculation pipeline for an MSME
   */
  async calculateScore(msmeId) {
    return scorePipeline.executePipeline(msmeId);
  }

  /**
   * Get current score for an MSME
   */
  async getCurrentScore(msmeId) {
    let latest = await healthScoreSnapshotRepository.findLatestByMsmeId(msmeId);
    if (!latest) {
      latest = await this.calculateScore(msmeId);
    }
    return latest;
  }

  /**
   * Get full health intelligence analysis
   */
  async getFullIntelligence(msmeId) {
    return healthIntelligenceFacade.generateFullIntelligence(msmeId);
  }

  /**
   * Get risk analysis
   */
  async getRiskAnalysis(msmeId) {
    const intel = await this.getFullIntelligence(msmeId);
    return intel.riskAnalysis;
  }

  /**
   * Get strengths and weaknesses
   */
  async getStrengthsWeaknesses(msmeId) {
    const intel = await this.getFullIntelligence(msmeId);
    return {
      strengths: intel.strengths,
      weaknesses: intel.weaknesses,
    };
  }

  /**
   * Get recommendations
   */
  async getRecommendations(msmeId) {
    const intel = await this.getFullIntelligence(msmeId);
    return intel.recommendations;
  }

  /**
   * Get executive health summary
   */
  async getExecutiveSummary(msmeId) {
    const intel = await this.getFullIntelligence(msmeId);
    return intel.summary;
  }

  /**
   * Get category score breakdown for an MSME
   */
  async getCategoryBreakdown(msmeId) {
    const snapshot = await this.getCurrentScore(msmeId);
    return {
      msmeId,
      overallScore: snapshot.overall_score || snapshot.overallScore,
      riskLevel: snapshot.risk_level || snapshot.riskLevel,
      categoryBreakdown: snapshot.category_breakdown || snapshot.categoryBreakdown,
      evaluatedAt: snapshot.evaluated_at || snapshot.evaluatedAt,
    };
  }

  /**
   * Get current active score configuration definition
   */
  async getActiveConfig() {
    const config = await healthScoreConfigRepository.findActiveConfig();
    return (
      config || {
        config_version: 'v1.0.0',
        max_score: 100,
        min_score: 0,
        category_definitions: { categories: ['TAX', 'LABOUR', 'CORPORATE', 'LICENSING'] },
        penalty_rules: { overdue_deduction: 15, due_deduction: 5 },
        bonus_rules: { perfect_compliance_bonus: 5 },
        status: 'ACTIVE',
      }
    );
  }

  /**
   * Get active score categories
   */
  async getCategories() {
    return scoreCategoryRepository.findActiveCategories();
  }

  /**
   * Get score snapshot history for an MSME
   */
  async getSnapshots(msmeId, query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = Math.min(parseInt(query.limit, 10) || 10, 100);
    const skip = (page - 1) * limit;

    const result = await healthScoreSnapshotRepository.findHistoryByMsmeId(msmeId, { skip, take: limit });

    return {
      items: result.items,
      pagination: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit) || 1,
      },
    };
  }

  /**
   * Get health intelligence domain metadata
   */
  async getHealthMetadata() {
    const config = await this.getActiveConfig();
    const categories = await this.getCategories();

    return {
      engineVersion: '1.0.0',
      activeConfigVersion: config.config_version,
      maxPossibleScore: config.max_score,
      minPossibleScore: config.min_score,
      supportedCategoriesCount: categories.length,
      categories: categories.map((c) => ({
        code: c.category_code,
        name: c.category_name,
        defaultWeight: c.default_weight,
      })),
      supportedRiskLevels: ['HIGH', 'MEDIUM', 'LOW', 'NONE'],
      eventsCatalog: Object.values(domainEventBus.EVENTS),
    };
  }
}

module.exports = new HealthIntelligenceService();
