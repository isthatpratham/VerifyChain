const eligibilityValidator = require('./EligibilityValidator');
const categoryEvaluator = require('./CategoryEvaluator');
const penaltyBonusEngine = require('./PenaltyBonusEngine');
const scoreAggregator = require('./ScoreAggregator');

const msmeProfileRepository = require('../repositories/msmeProfile.repository');
const complianceRecordRepository = require('../repositories/complianceRecord.repository');
const healthScoreConfigRepository = require('../repositories/healthScoreConfig.repository');
const scoreCategoryRepository = require('../repositories/scoreCategory.repository');
const healthScoreSnapshotRepository = require('../repositories/healthScoreSnapshot.repository');
const domainEventBus = require('../events/DomainEventBus');

class ScorePipeline {
  constructor() {
    // Background Domain Event Subscribers
    domainEventBus.subscribe(domainEventBus.EVENTS.BUSINESS_UPDATED, async (event) => {
      if (event.payload?.msmeId) {
        try {
          await this.executePipeline(event.payload.msmeId);
        } catch (err) {
          console.error(`[ScorePipeline] Auto-recalculation error for MSME ${event.payload.msmeId}:`, err);
        }
      }
    });

    domainEventBus.subscribe(domainEventBus.EVENTS.COMPLIANCE_EVALUATED, async (event) => {
      if (event.payload?.msmeId) {
        try {
          await this.executePipeline(event.payload.msmeId);
        } catch (err) {
          console.error(`[ScorePipeline] Auto-recalculation error for MSME ${event.payload.msmeId}:`, err);
        }
      }
    });
  }

  /**
   * Execute deterministic scoring pipeline
   */
  async executePipeline(msmeId) {
    const startTime = Date.now();

    // 1. Data Collection
    const profile = await msmeProfileRepository.findById(msmeId);
    if (!profile) throw new Error(`MSME Profile not found for ID ${msmeId}`);

    const records = await complianceRecordRepository.findByMsmeId(msmeId);
    const config = (await healthScoreConfigRepository.findActiveConfig()) || {
      config_version: 'v1.0.0',
      max_score: 100,
      min_score: 0,
      penalty_rules: { overdue_deduction: 15, due_deduction: 5 },
      bonus_rules: { perfect_compliance_bonus: 5 },
    };
    const categories = await scoreCategoryRepository.findActiveCategories();

    // 2. Eligibility Validation
    const validation = eligibilityValidator.validate(profile, records, config);
    if (!validation.isEligible) {
      throw new Error(`Score Pipeline Validation Failed: ${validation.errors.join(', ')}`);
    }

    // 3. Category Evaluation
    const categoryResults = categoryEvaluator.evaluateCategories(records, categories);

    // 4. Penalty & Bonus Evaluation
    const penaltyBonusResult = penaltyBonusEngine.evaluate(records, config);

    // 5. Weighted Aggregation & Normalization
    const aggregated = scoreAggregator.aggregate(categoryResults, penaltyBonusResult, config, profile);

    const executionTimeMs = Date.now() - startTime;

    // 6. Snapshot Generation & Persistence
    const snapshotPayload = {
      msme_id: msmeId,
      config_version: config.config_version || 'v1.0.0',
      overall_score: aggregated.overallScore,
      risk_level: aggregated.riskLevel,
      category_breakdown: categoryResults,
      recommendations_snapshot: {
        penaltyReasons: penaltyBonusResult.penaltyReasons,
        bonusReasons: penaltyBonusResult.bonusReasons,
        confidence: aggregated.confidence,
        explanation: aggregated.explanation,
      },
      engine_version: '1.0.0',
    };

    const snapshot = await healthScoreSnapshotRepository.create(snapshotPayload);

    // 7. Domain Event Bus Notification
    domainEventBus.publish(domainEventBus.EVENTS.SCORE_CALCULATED, {
      msmeId,
      score: aggregated.overallScore,
      riskLevel: aggregated.riskLevel,
      snapshotId: snapshot.id,
      executionTimeMs,
    });

    domainEventBus.publish(domainEventBus.EVENTS.SCORE_CALCULATION_REQUESTED, {
      msmeId,
      evaluatedAt: new Date().toISOString(),
    });

    return {
      msmeId,
      overallScore: aggregated.overallScore,
      riskLevel: aggregated.riskLevel,
      confidence: aggregated.confidence,
      configVersion: config.config_version,
      categoryBreakdown: categoryResults,
      explanation: aggregated.explanation,
      snapshotId: snapshot.id,
      executionTimeMs,
    };
  }
}

module.exports = new ScorePipeline();
