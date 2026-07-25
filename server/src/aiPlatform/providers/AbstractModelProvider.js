/**
 * AbstractModelProvider.js
 * Base Abstraction Interface for Model Providers (OpenAI, Anthropic, Gemini, Azure, Local, Mock).
 */

class AbstractModelProvider {
  constructor(providerCode, config = {}) {
    if (this.constructor === AbstractModelProvider) {
      throw new Error('AbstractModelProvider is an interface and cannot be instantiated directly.');
    }
    this.providerCode = providerCode;
    this.config = config;
  }

  /**
   * Execute model completion request
   * @param {Object} params - Execution parameters ({ systemPrompt, userPrompt, modelCode, temperature, maxTokens, outputSchema })
   * @returns {Promise<AIResponse>}
   */
  async generateCompletion(params) {
    throw new Error('generateCompletion() must be implemented by concrete Provider subclass.');
  }

  /**
   * Health check diagnostic
   * @returns {Promise<Object>}
   */
  async checkHealth() {
    return {
      providerCode: this.providerCode,
      status: 'OPERATIONAL',
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = AbstractModelProvider;
