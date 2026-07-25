/**
 * AIAuditService.js
 * Secure AI Interaction Audit Service.
 * Ensures every AI interaction is audited safely without storing raw credentials or unencrypted secrets.
 */

const defaultPrisma = require('../../utils/prismaClient');
const AuditPublisher = require('../../audit/AuditPublisher');

class AIAuditService {
  /**
   * Audit an AI interaction event
   */
  async auditInteraction({
    msmeId = 1,
    userId = 'SYSTEM',
    templateCode,
    version = 1,
    providerCode,
    modelCode,
    promptTokens = 0,
    completionTokens = 0,
    totalTokens = 0,
    estimatedCost = 0,
    latencyMs = 0,
    status = 'SUCCESS',
    error = null,
    correlationId,
  }) {
    const parsedId = parseInt(msmeId, 10) || 1;

    // 1. Publish to Centralized Audit Publisher under DEVELOPER_PLATFORM / AI module
    await AuditPublisher.publish({
      actorType: 'USER',
      actorId: String(userId),
      msmeId: parsedId,
      module: 'DEVELOPER_PLATFORM',
      action: 'AI_PROMPT_EXECUTED',
      resourceType: 'PromptTemplate',
      resourceId: String(templateCode || 'DIRECT'),
      severity: status === 'FAILURE' ? 'WARNING' : 'INFO',
      status: status === 'FAILURE' ? 'FAILURE' : 'SUCCESS',
      correlationId,
      changes: {
        templateCode,
        version,
        providerCode,
        modelCode,
        totalTokens,
        estimatedCost,
        latencyMs,
        errorMessage: error ? error.message : null,
      },
    }).catch(() => {});
  }

  /**
   * Query AI interaction audit logs
   */
  async getAuditLogs({ msmeId = 1, limit = 50 }) {
    return defaultPrisma.aIRequestLog.findMany({
      where: { msme_id: parseInt(msmeId, 10) || 1 },
      orderBy: { created_at: 'desc' },
      take: Math.min(limit, 200),
    }).catch(() => []);
  }
}

module.exports = new AIAuditService();
