const trustProfileValidator = require('./TrustProfileValidator');
const trustPolicyEngine = require('./TrustPolicyEngine');
const trustDecisionEngine = require('./TrustDecisionEngine');

const msmeProfileRepository = require('../repositories/msmeProfile.repository');
const complianceRecordRepository = require('../repositories/complianceRecord.repository');
const supplierTrustProfileRepository = require('../repositories/supplierTrustProfile.repository');
const trustTimelineRepository = require('../repositories/trustTimeline.repository');

const supplierTrustService = require('../services/supplierTrust.service');
const healthIntelligenceService = require('../services/healthIntelligence.service');
const domainEventBus = require('../events/DomainEventBus');

class TrustEvaluationPipeline {
  constructor() {
    // Background Domain Event Subscribers
    domainEventBus.subscribe(domainEventBus.EVENTS.SCORE_CALCULATED, async (event) => {
      if (event.payload?.msmeId) {
        try {
          await this.executeEvaluation(event.payload.msmeId);
        } catch (err) {
          console.error(`[TrustEvaluationPipeline] Auto-evaluation error for MSME ${event.payload.msmeId}:`, err);
        }
      }
    });
  }

  /**
   * Execute deterministic Supplier Trust Evaluation pipeline
   */
  async executeEvaluation(msmeId) {
    const startTime = Date.now();

    // 1. Data Collection
    const msme = await msmeProfileRepository.findById(msmeId);
    if (!msme) throw new Error(`MSME Profile not found for ID ${msmeId}`);

    const trustProfile = await supplierTrustService.getOrCreateTrustProfile(msmeId);
    const records = await complianceRecordRepository.findByMsmeId(msmeId);
    const healthSnapshot = await healthIntelligenceService.getCurrentScore(msmeId);

    // 2. Trust Profile Validation
    const validation = trustProfileValidator.validate(trustProfile, msme, records, healthSnapshot);
    if (!validation.isValid) {
      throw new Error(`Trust Evaluation Validation Failed: ${validation.errors.join(', ')}`);
    }

    const overallScore = healthSnapshot.overall_score !== undefined ? healthSnapshot.overall_score : (healthSnapshot.overallScore || 0);
    const riskLevel = healthSnapshot.risk_level || healthSnapshot.riskLevel || 'LOW';

    // 3. Trust Policy Evaluation
    const policyResult = trustPolicyEngine.evaluatePolicy(overallScore, riskLevel, records);

    // 4. Verification Decision Generation
    const decisionResult = trustDecisionEngine.generateDecision(policyResult, msme, healthSnapshot);

    const executionTimeMs = Date.now() - startTime;

    // 5. Database State Synchronization
    const updatedProfile = await supplierTrustProfileRepository.update(trustProfile.id, {
      trust_level: decisionResult.trustLevel,
      verification_state: decisionResult.verificationState,
      trust_score_snapshot: overallScore,
      is_public: decisionResult.trustLevel !== 'PENDING' && decisionResult.trustLevel !== 'SUSPENDED',
    });

    // 6. Log Timeline Audit Event
    await trustTimelineRepository.create({
      supplier_trust_profile_id: trustProfile.id,
      event_type: 'TRUST_EVALUATED',
      title: `Trust Level Evaluated: ${decisionResult.trustLevel}`,
      description: decisionResult.explanation,
      actor: 'SYSTEM',
      event_data: {
        decision: decisionResult.decision,
        confidence: decisionResult.confidence,
        healthScore: overallScore,
        executionTimeMs,
      },
    });

    // 7. Domain Event Bus Dispatch
    domainEventBus.publish(domainEventBus.EVENTS.TRUST_LEVEL_CHANGED, {
      profileId: trustProfile.id,
      msmeId,
      oldLevel: trustProfile.trust_level,
      newLevel: decisionResult.trustLevel,
    });

    if (decisionResult.decision === 'APPROVED') {
      domainEventBus.publish(domainEventBus.EVENTS.VERIFICATION_APPROVED, {
        profileId: trustProfile.id,
        msmeId,
        trustLevel: decisionResult.trustLevel,
      });
    } else if (decisionResult.decision === 'REJECTED') {
      domainEventBus.publish(domainEventBus.EVENTS.VERIFICATION_REJECTED, {
        profileId: trustProfile.id,
        msmeId,
        reason: decisionResult.explanation,
      });
    }

    return {
      msmeId,
      trustProfileId: trustProfile.id,
      decision: decisionResult.decision,
      trustLevel: decisionResult.trustLevel,
      verificationState: decisionResult.verificationState,
      confidence: decisionResult.confidence,
      healthScore: overallScore,
      evidenceSummary: decisionResult.evidenceSummary,
      explanation: decisionResult.explanation,
      executionTimeMs,
      updatedProfile,
    };
  }
}

module.exports = new TrustEvaluationPipeline();
