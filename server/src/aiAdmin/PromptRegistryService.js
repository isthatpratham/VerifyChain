/**
 * PromptRegistryService.js
 * Centralized Production Prompt Library & Versioning Orchestration (Phase 11.4).
 */

const defaultPrisma = require('../utils/prismaClient');

const STANDARD_PROMPTS = [
  { code: 'PROMPT_COMPLIANCE_ANALYSIS', name: 'Compliance Regulatory Analysis Prompt', category: 'COMPLIANCE', systemPrompt: 'You are an enterprise compliance auditor expert in GST, ISO, and MSME regulations.', templateText: 'Analyze business compliance document for {{businessName}}. Verify expiry date {{expiryDate}} and identify compliance gaps.' },
  { code: 'PROMPT_DOCUMENT_EXTRACTION', name: 'Document Vault Data Extraction Prompt', category: 'DOCUMENT', systemPrompt: 'You are an optical document intelligence parser.', templateText: 'Extract key attributes, registration numbers, and dates from uploaded document {{fileName}}.' },
  { code: 'PROMPT_PREDICTIVE_RISK', name: 'Predictive Compliance Risk Assessment', category: 'PREDICTIVE', systemPrompt: 'You are a financial risk analyst forecasting enterprise compliance risks.', templateText: 'Forecast compliance risk trajectory for {{organizationId}} given historical audit score {{auditScore}}.' },
];

class PromptRegistryService {
  /**
   * Seed Standard Production Prompt Catalog & Initial Version
   */
  static async seedPrompts(client = defaultPrisma) {
    const seeded = [];
    for (const p of STANDARD_PROMPTS) {
      let prompt = await client.aIAdminPrompt.findUnique({ where: { code: p.code } });
      if (!prompt) {
        prompt = await client.aIAdminPrompt.create({
          data: {
            code: p.code,
            name: p.name,
            category: p.category,
            system_prompt: p.systemPrompt,
            current_version: 1,
          },
        });

        await client.aIAdminPromptVersion.create({
          data: {
            prompt_id: prompt.id,
            version_number: 1,
            template_text: p.templateText,
            variables_json: ['businessName', 'expiryDate', 'fileName', 'organizationId', 'auditScore'],
            status: 'APPROVED',
            author_id: 'SYSTEM',
            review_notes: 'Initial production prompt baseline',
          },
        });
      }
      seeded.push(prompt);
    }
    return seeded;
  }

  /**
   * List Prompt Library with Versions
   */
  static async listPrompts(category = null, client = defaultPrisma) {
    await this.seedPrompts(client);

    const where = {};
    if (category && category !== 'ALL') where.category = category.toUpperCase();

    return await client.aIAdminPrompt.findMany({
      where,
      include: { versions: { orderBy: { version_number: 'desc' } } },
      orderBy: { code: 'asc' },
    });
  }

  /**
   * Create New Prompt in Catalog
   */
  static async createPrompt({ code, name, category = 'GENERAL', description = null, systemPrompt = null, templateText }, client = defaultPrisma) {
    const codeUpper = code.toUpperCase();
    const existing = await client.aIAdminPrompt.findUnique({ where: { code: codeUpper } });
    if (existing) throw new Error(`Prompt code '${codeUpper}' already exists.`);

    const prompt = await client.aIAdminPrompt.create({
      data: {
        code: codeUpper,
        name,
        category,
        description,
        system_prompt: systemPrompt,
        current_version: 1,
      },
    });

    const version = await client.aIAdminPromptVersion.create({
      data: {
        prompt_id: prompt.id,
        version_number: 1,
        template_text: templateText,
        status: 'APPROVED',
        author_id: 'ADMIN',
        review_notes: 'Initial prompt creation',
      },
    });

    return { prompt, version };
  }
}

module.exports = PromptRegistryService;
