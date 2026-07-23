const defaultPrisma = require('../utils/prismaClient');
const msmeProfileRepository = require('../repositories/msmeProfile.repository');
const { ruleExecutionEngine } = require('../rulesEngine');

const businessEventDispatcher = require('../events/BusinessEventDispatcher');

class ComplianceOrchestratorService {
  constructor() {
    // Register background listeners for business events
    businessEventDispatcher.on(
      businessEventDispatcher.EVENTS.BUSINESS_CREATED,
      async (payload) => {
        try {
          await this.synchronizeCompliance(payload.msmeId);
        } catch (err) {
          console.error(`[ComplianceOrchestrator] Error on BUSINESS_CREATED for MSME ID ${payload.msmeId}:`, err);
        }
      }
    );

    businessEventDispatcher.on(
      businessEventDispatcher.EVENTS.BUSINESS_UPDATED,
      async (payload) => {
        try {
          await this.handleBusinessUpdated(payload.msmeId, payload.changedFields);
        } catch (err) {
          console.error(`[ComplianceOrchestrator] Error on BUSINESS_UPDATED for MSME ID ${payload.msmeId}:`, err);
        }
      }
    );
  }

  /**
   * Determine affected statutory authorities based on changed profile fields
   */
  getAffectedAuthorities(changedFields = []) {
    if (!changedFields || changedFields.length === 0) {
      return ['GST', 'EPFO', 'ESIC', 'MCA', 'UDYAM', 'FSSAI'];
    }

    const authorities = new Set();
    for (const field of changedFields) {
      if (['gstin', 'annualTurnoverLakh'].includes(field)) authorities.add('GST');
      if (['employeeCount'].includes(field)) {
        authorities.add('EPFO');
        authorities.add('ESIC');
      }
      if (['businessType', 'isFoodBusiness'].includes(field)) authorities.add('FSSAI');
      if (['udyamNumber'].includes(field)) authorities.add('UDYAM');
      if (['state', 'sector', 'businessName'].includes(field)) authorities.add('MCA');
    }

    // Default to all authorities if unrecognized field
    return authorities.size > 0 ? Array.from(authorities) : ['GST', 'EPFO', 'ESIC', 'MCA', 'UDYAM', 'FSSAI'];
  }

  /**
   * Selective re-evaluation pipeline upon business profile changes
   */
  async handleBusinessUpdated(msmeId, changedFields = []) {
    const profile = await msmeProfileRepository.findById(msmeId);
    if (!profile) throw new Error(`MSME Profile not found for ID ${msmeId}`);

    const affectedAuthorities = this.getAffectedAuthorities(changedFields);
    console.log(`[ComplianceOrchestrator] Selective re-evaluation triggered for MSME ${msmeId}. Affected authorities: ${affectedAuthorities.join(', ')}`);

    // Execute Rules Engine Evaluation
    const evalResult = await ruleExecutionEngine.evaluateBusinessProfile(profile, { audit: true });

    // Synchronize ComplianceRecord database entities
    await this.persistEvaluationResults(msmeId, evalResult);

    businessEventDispatcher.emitBusinessEvent(businessEventDispatcher.EVENTS.COMPLIANCE_EVALUATED, {
      msmeId,
      evaluatedAt: evalResult.evaluatedAt,
      affectedAuthorities,
    });

    return evalResult;
  }

  /**
   * Full synchronization pipeline
   */
  async synchronizeCompliance(msmeId) {
    const profile = await msmeProfileRepository.findById(msmeId);
    if (!profile) throw new Error(`MSME Profile not found for ID ${msmeId}`);

    console.log(`[ComplianceOrchestrator] Executing full compliance synchronization for MSME ${msmeId}`);
    const evalResult = await ruleExecutionEngine.evaluateBusinessProfile(profile, { audit: true });
    await this.persistEvaluationResults(msmeId, evalResult);

    return evalResult;
  }

  /**
   * Persist evaluation results into ComplianceRecord DB entities
   */
  async persistEvaluationResults(msmeId, evalResult) {
    const { matchedRules, skippedRules } = evalResult;

    await defaultPrisma.$transaction(async (tx) => {
      // 1. Process applicable rules -> COMPLIANT / DUE / OVERDUE
      for (const rule of matchedRules) {
        const authority = rule.authority;
        const existing = await tx.complianceRecord.findUnique({
          where: { msme_id_authority: { msme_id: msmeId, authority } },
        });

        const status = existing?.status && existing.status !== 'UNKNOWN' ? existing.status : 'COMPLIANT';
        const priority = rule.priority || 'MEDIUM';

        await tx.complianceRecord.upsert({
          where: { msme_id_authority: { msme_id: msmeId, authority } },
          update: {
            priority,
            last_checked: new Date(),
            notes: rule.explanation,
          },
          create: {
            msme_id: msmeId,
            authority,
            status,
            priority,
            renewal_frequency: 'ANNUAL',
            risk_level: 'LOW',
            expiry_date: new Date(Date.now() + 180 * 86400000),
            last_checked: new Date(),
            notes: rule.explanation,
          },
        });
      }

      // 2. Process exempt rules -> EXEMPT
      for (const rule of skippedRules) {
        const authority = rule.authority;
        await tx.complianceRecord.upsert({
          where: { msme_id_authority: { msme_id: msmeId, authority } },
          update: {
            status: 'EXEMPT',
            last_checked: new Date(),
            notes: rule.explanation,
          },
          create: {
            msme_id: msmeId,
            authority,
            status: 'EXEMPT',
            priority: 'LOW',
            renewal_frequency: 'ANNUAL',
            risk_level: 'NONE',
            last_checked: new Date(),
            notes: rule.explanation,
          },
        });
      }

      // 3. Update last sync timestamp on profile
      await tx.msmeProfile.update({
        where: { id: msmeId },
        data: { last_compliance_sync: new Date() },
      });
    });
  }

  /**
   * Get orchestration sync status for an MSME
   */
  async getOrchestrationStatus(msmeId) {
    const profile = await msmeProfileRepository.findById(msmeId);
    if (!profile) throw new Error('MSME Profile not found.');

    const totalRecords = await defaultPrisma.complianceRecord.count({ where: { msme_id: msmeId } });
    const lastSync = profile.last_compliance_sync;

    return {
      msmeId,
      isSynchronized: totalRecords > 0,
      totalRecords,
      lastSync,
      orchestratorVersion: '1.0.0',
    };
  }
}

module.exports = new ComplianceOrchestratorService();
