const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const geminiAIService = require('../src/services/geminiAI.service');

describe('Phase 13.6 External AI & Advisory Integration Suite', () => {
  describe('Context Sanitization & Privacy Preservation', () => {
    test('Should sanitize context and remove undefined or sensitive properties', () => {
      const dirtyContext = {
        businessName: 'Apex Precision Tools',
        sector: 'Manufacturing',
        state: 'Karnataka',
        overallScore: 92,
        riskLevel: 'LOW',
        topPriorities: ['Annual GST Return Filing'],
        majorStrengths: ['Active GSTIN and Udyam Registration'],
        majorRisks: [],
        jwtToken: 'sensitive-token-should-be-omitted',
        dbPassword: 'secret-password-should-be-omitted',
      };

      const sanitized = geminiAIService.sanitizeContext(dirtyContext);
      assert.equal(sanitized.businessName, 'Apex Precision Tools');
      assert.equal(sanitized.overallScore, 92);
      assert.equal(sanitized.jwtToken, undefined);
      assert.equal(sanitized.dbPassword, undefined);
    });
  });

  describe('Resilience & Deterministic Fallback Strategy', () => {
    test('Should safely fall back to deterministic engine when unconfigured or offline', async () => {
      const deterministicSummary = {
        overallHealthText: 'EXCELLENT',
        score: 95,
        riskLevel: 'LOW',
        summaryText: 'Enterprise compliance health is EXCELLENT with a score of 95/100.',
      };

      const result = await geminiAIService.generateEnrichedComplianceSummary(
        { businessName: 'Sample Enterprise', overallScore: 95, riskLevel: 'LOW' },
        deterministicSummary
      );

      assert.equal(result.isAiEnriched, false);
      assert.equal(result.provider, 'DETERMINISTIC_RULES_ENGINE');
      assert.deepEqual(result.summary, deterministicSummary);
    });
  });
});
