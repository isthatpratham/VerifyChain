/**
 * AIPlatformConfig.js
 * Centralized Configuration Engine for Enterprise AI Platform.
 */

class AIPlatformConfig {
  constructor() {
    this.config = {
      defaultProvider: process.env.DEFAULT_AI_PROVIDER || 'MOCK',
      defaultModel: process.env.DEFAULT_AI_MODEL || 'mock-gpt-4o',
      temperature: 0.2,
      maxTokens: 2048,
      timeoutMs: 30000,
      maxRetries: 2,
      fallbackProvider: 'MOCK',
      featureFlags: {
        tokenAccounting: true,
        aiAuditing: true,
        contextInjection: true,
        conversationMemory: true,
      },
    };
  }

  getConfig() {
    return { ...this.config };
  }

  updateConfig(updates = {}) {
    this.config = {
      ...this.config,
      ...updates,
      featureFlags: {
        ...this.config.featureFlags,
        ...(updates.featureFlags || {}),
      },
    };
    return this.getConfig();
  }
}

module.exports = new AIPlatformConfig();
