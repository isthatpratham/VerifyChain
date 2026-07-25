/**
 * AIResponse.js
 * Standardized AI Execution Response Domain Object.
 */

class AIResponse {
  constructor({
    rawContent,
    parsedOutput = null,
    providerCode,
    modelCode,
    promptTokens = 0,
    completionTokens = 0,
    totalTokens = 0,
    estimatedCost = 0.0,
    latencyMs = 0,
    finishReason = 'STOP',
    metadata = {},
  }) {
    this.rawContent = rawContent;
    this.parsedOutput = parsedOutput || this._tryParseJson(rawContent);
    this.providerCode = providerCode;
    this.modelCode = modelCode;
    this.promptTokens = promptTokens;
    this.completionTokens = completionTokens;
    this.totalTokens = totalTokens || promptTokens + completionTokens;
    this.estimatedCost = estimatedCost;
    this.latencyMs = latencyMs;
    this.finishReason = finishReason;
    this.metadata = metadata;
    this.timestamp = new Date().toISOString();
  }

  _tryParseJson(content) {
    if (!content || typeof content !== 'string') return null;
    try {
      const clean = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(clean);
    } catch (e) {
      return null;
    }
  }

  toDict() {
    return {
      rawContent: this.rawContent,
      parsedOutput: this.parsedOutput,
      providerCode: this.providerCode,
      modelCode: this.modelCode,
      usage: {
        promptTokens: this.promptTokens,
        completionTokens: this.completionTokens,
        totalTokens: this.totalTokens,
        estimatedCost: this.estimatedCost,
      },
      latencyMs: this.latencyMs,
      finishReason: this.finishReason,
      timestamp: this.timestamp,
    };
  }
}

module.exports = AIResponse;
