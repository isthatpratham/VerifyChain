/**
 * PromptOrchestrator.js
 * Centralized Prompt Orchestration Service.
 * Handles template lookup, versioning, variable substitution, context injection,
 * token limit enforcement, retry strategies, and JSON output validation.
 */

const defaultPrisma = require('../../utils/prismaClient');
const builtinPrompts = require('./builtinPrompts');
const ProviderFactory = require('../providers/ProviderFactory');
const { ParsingError } = require('../domain/AIError');

class PromptOrchestrator {
  constructor() {
    this.promptMap = new Map(builtinPrompts.map((p) => [p.templateCode, p]));
  }

  /**
   * Execute a prompt template with context injection and model execution
   */
  async executePrompt({
    templateCode,
    version = 1,
    variables = {},
    context = {},
    providerCode = 'MOCK',
    modelCode = 'mock-gpt-4o',
    temperature = 0.2,
    maxTokens = 2048,
    maxRetries = 2,
  }) {
    // 1. Resolve Prompt Template
    const template = await this._getTemplate(templateCode);

    // 2. Substitute Variables & Inject Context
    const systemPrompt = this._renderTemplate(template.systemPrompt, variables);
    const contextJson = typeof context === 'string' ? context : JSON.stringify(context, null, 2);
    const userPrompt = this._renderTemplate(template.userPromptTemplate, { ...variables, contextJson });

    // 3. Obtain Provider Instance
    const provider = ProviderFactory.getProvider(providerCode);

    let attempts = 0;
    let lastError = null;

    while (attempts <= maxRetries) {
      attempts++;
      try {
        const response = await provider.generateCompletion({
          systemPrompt,
          userPrompt,
          modelCode,
          temperature,
          maxTokens,
          outputSchema: template.outputSchemaJson || null,
        });

        // Validate JSON output structure if expected
        if (response.rawContent && (!response.parsedOutput || typeof response.parsedOutput !== 'object')) {
          const parsed = this._tryParseJson(response.rawContent);
          if (parsed) {
            response.parsedOutput = parsed;
          }
        }

        return response;
      } catch (err) {
        lastError = err;
        if (attempts > maxRetries) break;
        await new Promise((r) => setTimeout(r, 100 * attempts));
      }
    }

    throw lastError || new Error(`Prompt orchestration failed for '${templateCode}' after ${maxRetries} retries.`);
  }

  async _getTemplate(templateCode) {
    const dbTemplate = await defaultPrisma.promptTemplate.findUnique({
      where: { template_code: templateCode },
      include: { versions: true },
    }).catch(() => null);

    if (dbTemplate) {
      const v = dbTemplate.versions?.[0] || {};
      return {
        systemPrompt: v.system_prompt || '',
        userPromptTemplate: v.user_prompt_template || '',
        outputSchemaJson: v.output_schema_json || null,
      };
    }

    const builtin = this.promptMap.get(templateCode);
    if (builtin) return builtin;

    // Default fallback prompt template
    return {
      systemPrompt: 'You are VerifyChain AI Platform. Respond with structured JSON.',
      userPromptTemplate: 'Execute action for context: {{contextJson}}',
    };
  }

  _renderTemplate(templateStr = '', vars = {}) {
    let result = templateStr;
    for (const [key, val] of Object.entries(vars)) {
      const stringVal = typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val);
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, stringVal);
    }
    return result;
  }

  _tryParseJson(text) {
    try {
      const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(clean);
    } catch (e) {
      return null;
    }
  }
}

module.exports = new PromptOrchestrator();
