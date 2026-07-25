/**
 * TokenAccountingService.js
 * Token Accounting, Usage Tracking & Cost Estimation Engine.
 */

const defaultPrisma = require('../../utils/prismaClient');

class TokenAccountingService {
  /**
   * Log AI request token consumption and cost
   */
  async logUsage({
    msmeId = 1,
    userId = 'SYSTEM',
    templateCode = 'DIRECT_PROMPT',
    templateVersion = 1,
    providerCode = 'MOCK',
    modelCode = 'mock-gpt-4o',
    promptTokens = 0,
    completionTokens = 0,
    totalTokens = 0,
    estimatedCost = 0.0,
    latencyMs = 0,
    status = 'SUCCESS',
    errorMessage = null,
    correlationId,
    metadata = {},
  }) {
    const finalCorrelationId = correlationId || `corr_ai_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const parsedMsmeId = parseInt(msmeId, 10) || 1;
    const computedTotal = totalTokens || promptTokens + completionTokens;

    return defaultPrisma.aIRequestLog.create({
      data: {
        msme_id: parsedMsmeId,
        user_id: String(userId),
        template_code: templateCode,
        template_version: templateVersion,
        provider_code: providerCode,
        model_code: modelCode,
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: computedTotal,
        estimated_cost: estimatedCost,
        latency_ms: latencyMs,
        status,
        error_message: errorMessage,
        correlation_id: finalCorrelationId,
        metadata_json: metadata,
      },
    });
  }

  /**
   * Aggregate token usage statistics for an MSME
   */
  async getUsageAnalytics({ msmeId = 1, startDate = null, endDate = null }) {
    const parsedId = parseInt(msmeId, 10) || 1;
    const logs = await defaultPrisma.aIRequestLog.findMany({
      where: { msme_id: parsedId },
    }).catch(() => []);

    const totalRequests = logs.length;
    const totalTokens = logs.reduce((acc, l) => acc + (l.total_tokens || 0), 0);
    const totalCost = logs.reduce((acc, l) => acc + (l.estimated_cost || 0.0), 0);
    const averageLatencyMs = totalRequests ? Math.round(logs.reduce((acc, l) => acc + (l.latency_ms || 0), 0) / totalRequests) : 0;
    const failureCount = logs.filter((l) => l.status !== 'SUCCESS').length;

    return {
      msmeId: parsedId,
      totalRequests,
      totalTokens,
      totalCostEstimatedUsd: Number(totalCost.toFixed(6)),
      averageLatencyMs,
      failureCount,
      successRate: totalRequests ? Number((((totalRequests - failureCount) / totalRequests) * 100).toFixed(2)) : 100.0,
    };
  }
}

module.exports = new TokenAccountingService();
