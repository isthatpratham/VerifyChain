const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const verificationService = require('../src/services/verification.service');
const ruleEvaluator = require('../src/rulesEngine/RuleEvaluator');
const categoryEvaluator = require('../src/scoreEngine/CategoryEvaluator');
const penaltyBonusEngine = require('../src/scoreEngine/PenaltyBonusEngine');
const scoreAggregator = require('../src/scoreEngine/ScoreAggregator');
const { isValidGstin, isValidPan, isValidUdyam } = require('../src/utils/validators');

describe('Phase 13 Comprehensive Business Logic & Intelligence Suite (13.5)', () => {
  describe('Statutory Verification Service & Validators', () => {
    test('Valid GSTIN format should pass validation and extract metadata', () => {
      const gstin = '27AABCU9603R1ZX';
      assert.equal(isValidGstin(gstin), true);

      const result = verificationService.validateGstin(gstin);
      assert.equal(result.isValid, true);
      assert.equal(result.data.stateCode, '27');
      assert.equal(result.data.pan, 'AABCU9603R');
      assert.equal(result.data.status, 'ACTIVE');
    });

    test('Invalid GSTIN format should fail with descriptive error', () => {
      const invalidGstin = 'INVALID_GSTIN_123';
      assert.equal(isValidGstin(invalidGstin), false);

      const result = verificationService.validateGstin(invalidGstin);
      assert.equal(result.isValid, false);
      assert.ok(result.message.includes('Invalid GSTIN format'));
    });

    test('PAN validation should correctly classify entity types', () => {
      const companyPan = 'AAACV1234F'; // 4th character 'C' = Company
      assert.equal(isValidPan(companyPan), true);
      const resC = verificationService.validatePan(companyPan);
      assert.equal(resC.data.entityType, 'Company');

      const personPan = 'ABEPD5678G'; // 4th character 'P' = Person
      assert.equal(isValidPan(personPan), true);
      const resP = verificationService.validatePan(personPan);
      assert.equal(resP.data.entityType, 'Individual / Person');
    });

    test('Udyam validation should parse state code and enterprise structure', () => {
      const udyam = 'UDYAM-MH-00-0012345';
      assert.equal(isValidUdyam(udyam), true);

      const result = verificationService.validateUdyam(udyam);
      assert.equal(result.isValid, true);
      assert.equal(result.data.stateCode, 'MH');
      assert.equal(result.data.status, 'VERIFIED_ACTIVE');
    });
  });

  describe('Deterministic Compliance Rules Engine', () => {
    test('RuleEvaluator condition operators (equals, greater_than, in, contains)', () => {
      const snapshot = {
        employee_count: 25,
        state: 'Maharashtra',
        sector: 'Manufacturing',
        is_food_business: true,
      };

      const eqCond = { field: 'sector', operator: 'equals', expected: 'Manufacturing' };
      assert.equal(ruleEvaluator.evaluateCondition(eqCond, snapshot).matched, true);

      const gtCond = { field: 'employee_count', operator: 'greater_than', expected: 20 };
      assert.equal(ruleEvaluator.evaluateCondition(gtCond, snapshot).matched, true);

      const inCond = { field: 'state', operator: 'in', expected: ['Maharashtra', 'Gujarat', 'Karnataka'] };
      assert.equal(ruleEvaluator.evaluateCondition(inCond, snapshot).matched, true);

      const containsCond = { field: 'sector', operator: 'contains', expected: 'factur' };
      assert.equal(ruleEvaluator.evaluateCondition(containsCond, snapshot).matched, true);
    });

    test('RuleEvaluator should execute composite rules (all and any groups)', () => {
      const epfoRule = {
        rule_id: 'RULE-EPFO-MANDATORY',
        rule_name: 'EPFO Registration Applicability',
        authority: 'EPFO',
        priority: 'HIGH',
        conditions: {
          all: [{ field: 'employee_count', operator: 'greater_than_or_equal', expected: 20 }],
        },
        success_explanation: 'Mandatory EPFO registration applicable (>20 employees)',
        failure_explanation: 'Voluntary EPFO registration (<=20 employees)',
      };

      const applicableSnapshot = { employee_count: 22 };
      const eval1 = ruleEvaluator.evaluateRule(epfoRule, applicableSnapshot);
      assert.equal(eval1.isApplicable, true);
      assert.equal(eval1.explanation, epfoRule.success_explanation);

      const nonApplicableSnapshot = { employee_count: 10 };
      const eval2 = ruleEvaluator.evaluateRule(epfoRule, nonApplicableSnapshot);
      assert.equal(eval2.isApplicable, false);
      assert.equal(eval2.explanation, epfoRule.failure_explanation);
    });
  });

  describe('Compliance Health Score Engine (0-100 CHS Specification)', () => {
    const mockCategories = [
      { category_code: 'TAX' },
      { category_code: 'LABOUR' },
      { category_code: 'CORPORATE' },
      { category_code: 'LICENSING' },
    ];

    test('Perfect compliance records should score 100 with bonus and LOW risk', () => {
      const records = [
        { authority: 'GST', status: 'COMPLIANT' },
        { authority: 'EPFO', status: 'COMPLIANT' },
        { authority: 'MCA', status: 'COMPLIANT' },
        { authority: 'UDYAM', status: 'COMPLIANT' },
      ];

      const categoryResults = categoryEvaluator.evaluateCategories(records, mockCategories);
      const penaltyBonus = penaltyBonusEngine.evaluate(records, {
        penalty_rules: { overdue_deduction: 15, due_deduction: 5 },
        bonus_rules: { perfect_compliance_bonus: 5 },
      });

      assert.equal(penaltyBonus.totalPenalties, 0);
      assert.equal(penaltyBonus.totalBonuses, 5);

      const profile = { gstin: '27AABCU9603R1ZX', udyam_number: 'UDYAM-MH-00-0012345', employee_count: 15, annual_turnover_lakh: 120 };
      const aggregated = scoreAggregator.aggregate(categoryResults, penaltyBonus, { max_score: 100, min_score: 0 }, profile);

      assert.equal(aggregated.overallScore, 100, 'Score is clamped at 100');
      assert.equal(aggregated.riskLevel, 'LOW');
      assert.equal(aggregated.confidence, 100);
    });

    test('Overdue filings should incur statutory penalties and escalate to HIGH risk', () => {
      const records = [
        { authority: 'GST', status: 'OVERDUE' },
        { authority: 'EPFO', status: 'OVERDUE' },
        { authority: 'MCA', status: 'DUE' },
        { authority: 'UDYAM', status: 'COMPLIANT' },
      ];

      const categoryResults = categoryEvaluator.evaluateCategories(records, mockCategories);
      const penaltyBonus = penaltyBonusEngine.evaluate(records, {
        penalty_rules: { overdue_deduction: 15, due_deduction: 5 },
        bonus_rules: { perfect_compliance_bonus: 5 },
      });

      assert.equal(penaltyBonus.totalPenalties, 35); // 15 + 15 + 5
      assert.equal(penaltyBonus.totalBonuses, 0);

      const profile = { gstin: '27AABCU9603R1ZX' };
      const aggregated = scoreAggregator.aggregate(categoryResults, penaltyBonus, { max_score: 100, min_score: 0 }, profile);

      assert.ok(aggregated.overallScore < 60, 'Score should be low');
      assert.equal(aggregated.riskLevel, 'HIGH');
    });
  });
});
