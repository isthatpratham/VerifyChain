const ruleEvaluator = require('./RuleEvaluator');
const complianceRuleRepository = require('../repositories/complianceRule.repository');

class RuleExecutionEngine {
  /**
   * Build clean input snapshot from MsmeProfile object
   */
  createSnapshot(msmeProfile) {
    return {
      msme_id: msmeProfile.id,
      business_name: msmeProfile.business_name,
      gstin: msmeProfile.gstin,
      udyam_number: msmeProfile.udyam_number,
      business_type: msmeProfile.business_type,
      sector: msmeProfile.sector,
      state: msmeProfile.state,
      district: msmeProfile.district,
      employee_count: msmeProfile.employee_count,
      annual_turnover_lakh: msmeProfile.annual_turnover_lakh,
      is_food_business: msmeProfile.is_food_business,
      is_profile_complete: msmeProfile.is_profile_complete,
    };
  }

  /**
   * Execute all active rules against a business profile
   */
  async evaluateBusinessProfile(msmeProfile, options = {}) {
    const startTime = Date.now();
    const snapshot = this.createSnapshot(msmeProfile);
    const rules = await complianceRuleRepository.findActiveRules();

    const applicableCompliances = [];
    const exemptCompliances = [];
    const matchedRules = [];
    const skippedRules = [];
    const explanations = [];

    for (const rule of rules) {
      const evalResult = ruleEvaluator.evaluateRule(rule, snapshot);
      const executionTimeMs = Date.now() - startTime;

      const logPayload = {
        msme_id: msmeProfile.id,
        rule_id: rule.id,
        execution_time_ms: parseFloat(executionTimeMs.toFixed(2)),
        is_applicable: evalResult.isApplicable,
        matched_conditions: evalResult.matchedConditions,
        explanation: evalResult.explanation,
        input_snapshot: snapshot,
        engine_version: '1.0.0',
      };

      if (options.audit !== false) {
        await complianceRuleRepository.createAuditLog(logPayload);
      }

      if (evalResult.isApplicable) {
        applicableCompliances.push(rule.authority);
        matchedRules.push(evalResult);
      } else {
        exemptCompliances.push(rule.authority);
        skippedRules.push(evalResult);
      }

      explanations.push({
        authority: rule.authority,
        ruleId: rule.rule_id,
        ruleName: rule.rule_name,
        isApplicable: evalResult.isApplicable,
        explanation: evalResult.explanation,
      });
    }

    const totalExecutionTimeMs = Date.now() - startTime;

    return {
      msmeId: msmeProfile.id,
      evaluatedAt: new Date().toISOString(),
      executionTimeMs: totalExecutionTimeMs,
      engineVersion: '1.0.0',
      applicableCompliances: Array.from(new Set(applicableCompliances)),
      exemptCompliances: Array.from(new Set(exemptCompliances)),
      matchedRules,
      skippedRules,
      explanations,
    };
  }
}

module.exports = new RuleExecutionEngine();
