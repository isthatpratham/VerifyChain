/**
 * builtinModels.js
 * Catalog of Supported AI Models and Platform Capabilities.
 */

module.exports = [
  {
    modelCode: 'gpt-4o',
    providerCode: 'OPENAI',
    name: 'OpenAI GPT-4o Flagship',
    contextWindow: 128000,
    promptCostPer1k: 0.0025,
    completionCostPer1k: 0.010,
    latencyMs: 380,
    isDefault: true,
    capabilities: ['json_schema', 'context_injection', 'multimodal'],
  },
  {
    modelCode: 'claude-3-5-sonnet',
    providerCode: 'ANTHROPIC',
    name: 'Anthropic Claude 3.5 Sonnet',
    contextWindow: 200000,
    promptCostPer1k: 0.003,
    completionCostPer1k: 0.015,
    latencyMs: 420,
    isDefault: false,
    capabilities: ['long_context', 'reasoning', 'json_schema'],
  },
  {
    modelCode: 'gemini-1.5-flash',
    providerCode: 'GEMINI',
    name: 'Google Gemini 1.5 Flash',
    contextWindow: 1000000,
    promptCostPer1k: 0.00035,
    completionCostPer1k: 0.00105,
    latencyMs: 290,
    isDefault: false,
    capabilities: ['ultra_long_context', 'fast_inference'],
  },
  {
    modelCode: 'mock-gpt-4o',
    providerCode: 'MOCK',
    name: 'VerifyChain Offline Mock Model',
    contextWindow: 128000,
    promptCostPer1k: 0.0,
    completionCostPer1k: 0.0,
    latencyMs: 25,
    isDefault: false,
    capabilities: ['offline_testing', 'deterministic'],
  },
  {
    modelCode: 'llama3:latest',
    providerCode: 'LOCAL',
    name: 'Local Ollama Llama 3',
    contextWindow: 32768,
    promptCostPer1k: 0.0,
    completionCostPer1k: 0.0,
    latencyMs: 650,
    isDefault: false,
    capabilities: ['on_premise', 'privacy_isolated'],
  },
];
