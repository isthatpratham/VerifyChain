const msmeProfileRepository = require('../repositories/msmeProfile.repository');
const complianceRuleRepository = require('../repositories/complianceRule.repository');
const { ruleExecutionEngine } = require('../rulesEngine');

class RulesEngineService {
  /**
   * Evaluate compliance rules for an MSME business profile
   */
  async evaluateRules(msmeId) {
    const profile = await msmeProfileRepository.findById(msmeId);
    if (!profile) {
      const error = new Error('MSME Profile not found.');
      error.statusCode = 404;
      throw error;
    }

    return ruleExecutionEngine.evaluateBusinessProfile(profile, { audit: true });
  }

  /**
   * Explain compliance decision for an MSME
   */
  async explainDecision(msmeId, authority = null) {
    const result = await this.evaluateRules(msmeId);
    if (authority) {
      const filtered = result.explanations.filter(
        (exp) => exp.authority.toLowerCase() === authority.toLowerCase()
      );
      return {
        msmeId,
        authority,
        explanations: filtered,
      };
    }

    return {
      msmeId,
      explanations: result.explanations,
    };
  }

  /**
   * Preview rule evaluation for arbitrary business profile parameters
   */
  async previewEvaluation(inputSnapshot) {
    const mockProfile = {
      id: inputSnapshot.msme_id || 0,
      business_name: inputSnapshot.businessName || 'Preview Enterprise',
      gstin: inputSnapshot.gstin || '',
      udyam_number: inputSnapshot.udyamNumber || '',
      business_type: inputSnapshot.businessType || 'MANUFACTURING',
      sector: inputSnapshot.sector || 'General',
      state: inputSnapshot.state || 'Maharashtra',
      district: inputSnapshot.district || 'Mumbai',
      employee_count: inputSnapshot.employeeCount !== undefined ? parseInt(inputSnapshot.employeeCount, 10) : 0,
      annual_turnover_lakh: inputSnapshot.annualTurnoverLakh !== undefined ? parseFloat(inputSnapshot.annualTurnoverLakh) : 0,
      is_food_business: Boolean(inputSnapshot.isFoodBusiness),
      is_profile_complete: true,
    };

    return ruleExecutionEngine.evaluateBusinessProfile(mockProfile, { audit: false });
  }

  /**
   * Get audit evaluation history for an MSME
   */
  async getAuditHistory(msmeId, query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = Math.min(parseInt(query.limit, 10) || 10, 100);
    const skip = (page - 1) * limit;

    const result = await complianceRuleRepository.getAuditLogs(msmeId, { skip, take: limit });

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
}

module.exports = new RulesEngineService();
