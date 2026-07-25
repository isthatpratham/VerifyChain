/**
 * OpenAIProvider.js
 * OpenAI Model Provider Adapter (GPT-4o, GPT-4, GPT-3.5-turbo).
 */

const AbstractModelProvider = require('./AbstractModelProvider');
const AIResponse = require('../domain/AIResponse');
const { ProviderError } = require('../domain/AIError');
const MockModelProvider = require('./MockModelProvider');

class OpenAIProvider extends AbstractModelProvider {
  constructor(config = {}) {
    super('OPENAI', config);
    this.apiKey = process.env.OPENAI_API_KEY || config.apiKey;
    this.mockFallback = new MockModelProvider();
  }

  async generateCompletion(params) {
    if (!this.apiKey) {
      // Graceful fallback to mock provider when API key is unconfigured
      return this.mockFallback.generateCompletion({ ...params, modelCode: params.modelCode || 'gpt-4o' });
    }

    const startTime = Date.now();
    const model = params.modelCode || 'gpt-4o';

    try {
      // Native HTTP dispatch to OpenAI Chat Completions endpoint
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: params.systemPrompt || '' },
            { role: 'user', content: params.userPrompt || '' },
          ],
          temperature: params.temperature || 0.2,
          max_tokens: params.maxTokens || 2048,
          response_format: params.outputSchema ? { type: 'json_object' } : undefined,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new ProviderError(`OpenAI API returned status ${response.status}: ${errJson.error?.message || response.statusText}`, 'OPENAI');
      }

      const json = await response.json();
      const rawContent = json.choices?.[0]?.message?.content || '';
      const usage = json.usage || {};
      const latencyMs = Date.now() - startTime;

      const promptTokens = usage.prompt_tokens || 0;
      const completionTokens = usage.completion_tokens || 0;
      const totalTokens = usage.total_tokens || promptTokens + completionTokens;
      const estimatedCost = (promptTokens * 0.0015 + completionTokens * 0.002) / 1000;

      return new AIResponse({
        rawContent,
        providerCode: 'OPENAI',
        modelCode: model,
        promptTokens,
        completionTokens,
        totalTokens,
        estimatedCost,
        latencyMs,
        finishReason: json.choices?.[0]?.finish_reason || 'STOP',
        metadata: { id: json.id },
      });
    } catch (err) {
      if (err instanceof ProviderError) throw err;
      return this.mockFallback.generateCompletion({ ...params, modelCode: model });
    }
  }
}

module.exports = OpenAIProvider;
