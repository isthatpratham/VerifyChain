/**
 * PromptVersionService.js
 * Immutable Prompt Versioning, Diffs & Rollback Engine (Phase 11.4).
 */

const defaultPrisma = require('../utils/prismaClient');

class PromptVersionService {
  /**
   * Create New Version for Prompt (Immutable History)
   */
  static async createNewVersion({ promptId, templateText, variables = [], authorId = 'ADMIN', reviewNotes = null }, client = defaultPrisma) {
    const isId = !isNaN(Number(promptId));
    const prompt = await client.aIAdminPrompt.findFirst({
      where: isId ? { id: Number(promptId) } : { code: String(promptId).toUpperCase() },
    });

    if (!prompt) throw new Error(`Prompt '${promptId}' not found for version creation.`);

    const nextVersionNum = prompt.current_version + 1;

    const version = await client.aIAdminPromptVersion.create({
      data: {
        prompt_id: prompt.id,
        version_number: nextVersionNum,
        template_text: templateText,
        variables_json: variables,
        status: 'APPROVED',
        author_id: String(authorId),
        review_notes: reviewNotes || `Version ${nextVersionNum} published`,
      },
    });

    await client.aIAdminPrompt.update({
      where: { id: prompt.id },
      data: { current_version: nextVersionNum },
    });

    // Record AI audit event
    await client.aIAdminAuditEvent.create({
      data: {
        action: 'PROMPT_VERSION_CREATED',
        actor_id: String(authorId),
        details_json: { promptCode: prompt.code, versionNumber: nextVersionNum },
      },
    });

    return version;
  }

  /**
   * Rollback Prompt to Target Historical Version
   */
  static async rollbackPrompt(promptId, targetVersionNumber, rollbackBy = 'ADMIN', client = defaultPrisma) {
    const isId = !isNaN(Number(promptId));
    const prompt = await client.aIAdminPrompt.findFirst({
      where: isId ? { id: Number(promptId) } : { code: String(promptId).toUpperCase() },
    });

    if (!prompt) throw new Error(`Prompt '${promptId}' not found.`);

    const targetVersion = await client.aIAdminPromptVersion.findFirst({
      where: { prompt_id: prompt.id, version_number: Number(targetVersionNumber) },
    });

    if (!targetVersion) throw new Error(`Prompt Version ${targetVersionNumber} not found for rollback.`);

    // Create a new version copying the target version's template (preserving immutability)
    return await this.createNewVersion({
      promptId: prompt.id,
      templateText: targetVersion.template_text,
      variables: targetVersion.variables_json,
      authorId: rollbackBy,
      reviewNotes: `Rollback to historical version ${targetVersionNumber}`,
    }, client);
  }
}

module.exports = PromptVersionService;
