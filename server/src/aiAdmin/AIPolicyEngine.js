/**
 * AIPolicyEngine.js
 * AI Governance Policies & Rules Engine (Phase 11.4).
 */

const defaultPrisma = require('../utils/prismaClient');

const DEFAULT_AI_POLICIES = [
  { code: 'MAX_CONTEXT_BOUND', name: 'Maximum Context Window Bound', rule_type: 'CONTEXT_SIZE', rules: { maxContextTokens: 128000, maxResponseTokens: 4096 } },
  { code: 'STRICT_PII_REDACTION', name: 'Strict PII & Sensitive Masking Policy', rule_type: 'PII_HANDLING', rules: { maskAadhaar: true, maskPAN: true, maskBankAccount: true } },
  { code: 'HUMAN_APPROVAL_THRESHOLD', name: 'Human Review Mandatory Threshold', rule_type: 'HUMAN_REVIEW', rules: { confidenceThreshold: 0.85, mandatoryReviewCategories: ['FINANCIAL_DISBURSEMENT', 'LEGAL_TERMINATION'] } },
];

class AIPolicyEngine {
  /**
   * Seed Standard AI Governance Policies
   */
  static async seedPolicies(client = defaultPrisma) {
    const seeded = [];
    for (const p of DEFAULT_AI_POLICIES) {
      const policy = await client.aIAdminPolicy.upsert({
        where: { code: p.code },
        update: { name: p.name, rules_json: p.rules },
        create: {
          code: p.code,
          name: p.name,
          rule_type: p.rule_type,
          rules_json: p.rules,
        },
      });
      seeded.push(policy);
    }
    return seeded;
  }

  /**
   * List AI Policies
   */
  static async listPolicies(client = defaultPrisma) {
    await this.seedPolicies(client);
    return await client.aIAdminPolicy.findMany({
      orderBy: { code: 'asc' },
    });
  }

  /**
   * Toggle or Update Policy
   */
  static async updatePolicy({ code, isActive, rules }, client = defaultPrisma) {
    const codeUpper = code.toUpperCase();
    return await client.aIAdminPolicy.update({
      where: { code: codeUpper },
      data: {
        is_active: isActive !== undefined ? Boolean(isActive) : undefined,
        rules_json: rules !== undefined ? rules : undefined,
      },
    });
  }
}

module.exports = AIPolicyEngine;
