/**
 * LocalModelProvider.js
 * Local LLM Driver Adapter (Ollama / Local HTTP Endpoint).
 */

const AbstractModelProvider = require('./AbstractModelProvider');
const AIResponse = require('../domain/AIResponse');
const MockModelProvider = require('./MockModelProvider');

class LocalModelProvider extends AbstractModelProvider {
  constructor(config = {}) {
    super('LOCAL', config);
    this.endpoint = process.env.LOCAL_AI_ENDPOINT || config.endpoint || 'http://localhost:11434';
    this.mockFallback = new MockModelProvider();
  }

  async generateCompletion(params) {
    const startTime = Date.now();
    const model = params.modelCode || 'llama3:latest';

    try {
      const response = await fetch(`${this.endpoint.replace(/\/$/, '')}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt: `${params.systemPrompt ? params.systemPrompt + '\n\n' : ''}${params.userPrompt}`,
          stream: false,
          options: { temperature: params.temperature || 0.2 },
        }),
      });

      if (!response.ok) {
        return this.mockFallback.generateCompletion({ ...params, modelCode: model });
      }

      const json = await response.json();
      const rawContent = json.response || '';
      const latencyMs = Date.now() - startTime;

      const promptTokens = Math.ceil((params.systemPrompt || '').length / 4 + (params.userPrompt || '').length / 4);
      const completionTokens = Math.ceil(rawContent.length / 4);

      return new AIResponse({
        rawContent,
        providerCode: 'LOCAL',
        modelCode: model,
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        estimatedCost: 0.0, // Local execution cost
        latencyMs,
        finishReason: 'STOP',
      });
    } catch (err) {
      return this.mockFallback.generateCompletion({ ...params, modelCode: model });
    }
  }
}

module.exports = LocalModelProvider;
