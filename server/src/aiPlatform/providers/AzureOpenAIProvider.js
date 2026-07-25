/**
 * AzureOpenAIProvider.js
 * Azure OpenAI Service Adapter.
 */

const AbstractModelProvider = require('./AbstractModelProvider');
const AIResponse = require('../domain/AIResponse');
const MockModelProvider = require('./MockModelProvider');

class AzureOpenAIProvider extends AbstractModelProvider {
  constructor(config = {}) {
    super('AZURE_OPENAI', config);
    this.endpoint = process.env.AZURE_OPENAI_ENDPOINT || config.endpoint;
    this.apiKey = process.env.AZURE_OPENAI_API_KEY || config.apiKey;
    this.deployment = process.env.AZURE_OPENAI_DEPLOYMENT || config.deployment || 'gpt-4o-deployment';
    this.mockFallback = new MockModelProvider();
  }

  async generateCompletion(params) {
    if (!this.endpoint || !this.apiKey) {
      return this.mockFallback.generateCompletion({ ...params, modelCode: params.modelCode || 'azure-gpt-4o' });
    }

    const startTime = Date.now();
    const model = params.modelCode || this.deployment;

    try {
      const url = `${this.endpoint.replace(/\/$/, '')}/openai/deployments/${this.deployment}/chat/completions?api-version=2024-02-15-preview`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: params.systemPrompt || '' },
            { role: 'user', content: params.userPrompt || '' },
          ],
          temperature: params.temperature || 0.2,
          max_tokens: params.maxTokens || 2048,
        }),
      });

      if (!response.ok) {
        return this.mockFallback.generateCompletion({ ...params, modelCode: model });
      }

      const json = await response.json();
      const rawContent = json.choices?.[0]?.message?.content || '';
      const usage = json.usage || {};
      const latencyMs = Date.now() - startTime;

      const promptTokens = usage.prompt_tokens || 0;
      const completionTokens = usage.completion_tokens || 0;
      const totalTokens = usage.total_tokens || promptTokens + completionTokens;

      return new AIResponse({
        rawContent,
        providerCode: 'AZURE_OPENAI',
        modelCode: model,
        promptTokens,
        completionTokens,
        totalTokens,
        estimatedCost: (totalTokens * 0.002) / 1000,
        latencyMs,
        finishReason: json.choices?.[0]?.finish_reason || 'STOP',
      });
    } catch (err) {
      return this.mockFallback.generateCompletion({ ...params, modelCode: model });
    }
  }
}

module.exports = AzureOpenAIProvider;
