/**
 * GeminiProvider.js
 * Google Gemini Model Provider Adapter (Gemini 1.5 Flash, Gemini 1.5 Pro).
 */

const AbstractModelProvider = require('./AbstractModelProvider');
const AIResponse = require('../domain/AIResponse');
const MockModelProvider = require('./MockModelProvider');

class GeminiProvider extends AbstractModelProvider {
  constructor(config = {}) {
    super('GEMINI', config);
    this.apiKey = process.env.GEMINI_API_KEY || config.apiKey;
    this.mockFallback = new MockModelProvider();
  }

  async generateCompletion(params) {
    if (!this.apiKey) {
      return this.mockFallback.generateCompletion({ ...params, modelCode: params.modelCode || 'gemini-1.5-flash' });
    }

    const startTime = Date.now();
    const model = params.modelCode || 'gemini-1.5-flash';

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${params.systemPrompt ? params.systemPrompt + '\n\n' : ''}${params.userPrompt}` }],
            },
          ],
          generationConfig: {
            temperature: params.temperature || 0.2,
            maxOutputTokens: params.maxTokens || 2048,
          },
        }),
      });

      if (!response.ok) {
        return this.mockFallback.generateCompletion({ ...params, modelCode: model });
      }

      const json = await response.json();
      const rawContent = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const usage = json.usageMetadata || {};
      const latencyMs = Date.now() - startTime;

      const promptTokens = usage.promptTokenCount || 0;
      const completionTokens = usage.candidatesTokenCount || 0;
      const totalTokens = usage.totalTokenCount || promptTokens + completionTokens;
      const estimatedCost = (promptTokens * 0.00035 + completionTokens * 0.00105) / 1000;

      return new AIResponse({
        rawContent,
        providerCode: 'GEMINI',
        modelCode: model,
        promptTokens,
        completionTokens,
        totalTokens,
        estimatedCost,
        latencyMs,
        finishReason: json.candidates?.[0]?.finishReason || 'STOP',
        metadata: { model },
      });
    } catch (err) {
      return this.mockFallback.generateCompletion({ ...params, modelCode: model });
    }
  }
}

module.exports = GeminiProvider;
