/**
 * ProviderFactory.js
 * Model Provider Factory & Resolution Manager.
 */

const OpenAIProvider = require('./OpenAIProvider');
const AnthropicProvider = require('./AnthropicProvider');
const GeminiProvider = require('./GeminiProvider');
const AzureOpenAIProvider = require('./AzureOpenAIProvider');
const LocalModelProvider = require('./LocalModelProvider');
const MockModelProvider = require('./MockModelProvider');

class ProviderFactory {
  constructor() {
    this.providers = new Map();
    this._registerDefaultProviders();
  }

  _registerDefaultProviders() {
    this.providers.set('MOCK', new MockModelProvider());
    this.providers.set('OPENAI', new OpenAIProvider());
    this.providers.set('ANTHROPIC', new AnthropicProvider());
    this.providers.set('GEMINI', new GeminiProvider());
    this.providers.set('AZURE_OPENAI', new AzureOpenAIProvider());
    this.providers.set('LOCAL', new LocalModelProvider());
  }

  /**
   * Get provider instance by code
   * @param {string} providerCode - Target provider code (e.g. MOCK, OPENAI, ANTHROPIC, GEMINI)
   * @returns {AbstractModelProvider}
   */
  getProvider(providerCode = 'MOCK') {
    const code = (providerCode || 'MOCK').toUpperCase();
    if (!this.providers.has(code)) {
      console.warn(`[ProviderFactory] Unknown provider '${code}', falling back to MOCK provider.`);
      return this.providers.get('MOCK');
    }
    return this.providers.get(code);
  }

  /**
   * List registered provider status
   */
  listProviders() {
    return Array.from(this.providers.keys()).map((code) => ({
      providerCode: code,
      isConfigured: code === 'MOCK' || Boolean(process.env[`${code}_API_KEY`]),
    }));
  }
}

module.exports = new ProviderFactory();
