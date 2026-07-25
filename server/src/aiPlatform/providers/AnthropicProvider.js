/**
 * AnthropicProvider.js
 * Anthropic Claude Model Provider Adapter (Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku).
 */

const AbstractModelProvider = require('./AbstractModelProvider');
const AIResponse = require('../domain/AIResponse');
const MockModelProvider = require('./MockModelProvider');

class AnthropicProvider extends AbstractModelProvider {
  constructor(config = {}) {
    super('ANTHROPIC', config);
    this.apiKey = process.env.ANTHROPIC_API_KEY || config.apiKey;
    this.mockFallback = new MockModelProvider();
  }

  async generateCompletion(params) {
    if (!this.apiKey) {
      return this.mockFallback.generateCompletion({ ...params, modelCode: params.modelCode || 'claude-3-5-sonnet' });
    }

    const startTime = Date.now();
    const model = params.modelCode || 'claude-3-5-sonnet-20240620';

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          system: params.systemPrompt || '',
          messages: [{ role: 'user', content: params.userPrompt || '' }],
          max_tokens: params.maxTokens || 2048,
          temperature: params.temperature || 0.2,
        }),
      });

      if (!response.ok) {
        return this.mockFallback.generateCompletion({ ...params, modelCode: model });
      }

      const json = await response.json();
      const rawContent = json.content?.[0]?.text || '';
      const usage = json.usage || {};
      const latencyMs = Date.now() - startTime;

      const promptTokens = usage.input_tokens || 0;
      const completionTokens = usage.output_tokens || 0;
      const totalTokens = promptTokens + completionTokens;
      const estimatedCost = (promptTokens * 0.003 + completionTokens * 0.015) / 1000;

      return new AIResponse({
        rawContent,
        providerCode: 'ANTHROPIC',
        modelCode: model,
        promptTokens,
        completionTokens,
        totalTokens,
        estimatedCost,
        latencyMs,
        finishReason: json.stop_reason || 'STOP',
        metadata: { id: json.id },
      });
    } catch (err) {
      return this.mockFallback.generateCompletion({ ...params, modelCode: model });
    }
  }
}

module.exports = AnthropicProvider;
