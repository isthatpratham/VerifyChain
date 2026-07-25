/**
 * MockModelProvider.js
 * Deterministic Mock Provider for Offline Development & Verification Testing.
 */

const AbstractModelProvider = require('./AbstractModelProvider');
const AIResponse = require('../domain/AIResponse');

class MockModelProvider extends AbstractModelProvider {
  constructor(config = {}) {
    super('MOCK', config);
  }

  async generateCompletion({
    systemPrompt = '',
    userPrompt = '',
    modelCode = 'mock-gpt-4o',
    temperature = 0.2,
    maxTokens = 1000,
    outputSchema = null,
  }) {
    const startTime = Date.now();

    // Determine deterministic mock response based on prompt domain keywords
    let rawContent = '';
    const promptLower = (systemPrompt + ' ' + userPrompt).toLowerCase();

    if (promptLower.includes('compliance') || promptLower.includes('risk')) {
      rawContent = JSON.stringify({
        status: 'COMPLIANT',
        riskScore: 92,
        findings: ['GSTIN filing is up to date', 'PAN verification validated'],
        recommendation: 'Maintain current filing schedule',
      });
    } else if (promptLower.includes('trust') || promptLower.includes('supplier')) {
      rawContent = JSON.stringify({
        trustScore: 95,
        trustBadge: 'GOLD_SUPPLIER',
        verificationStatus: 'VERIFIED',
        keyFactors: ['36 months flawless invoice record', 'Zero tax defaults'],
      });
    } else {
      rawContent = JSON.stringify({
        message: 'Verified by VerifyChain Enterprise AI Platform Infrastructure',
        processedPromptLength: userPrompt.length,
        status: 'SUCCESS',
      });
    }

    const latencyMs = Date.now() - startTime + 25;
    const promptTokens = Math.ceil((systemPrompt.length + userPrompt.length) / 4);
    const completionTokens = Math.ceil(rawContent.length / 4);
    const totalTokens = promptTokens + completionTokens;
    const estimatedCost = (promptTokens * 0.0015 + completionTokens * 0.002) / 1000;

    return new AIResponse({
      rawContent,
      providerCode: 'MOCK',
      modelCode,
      promptTokens,
      completionTokens,
      totalTokens,
      estimatedCost,
      latencyMs,
      finishReason: 'STOP',
      metadata: { mockExecution: true },
    });
  }
}

module.exports = MockModelProvider;
