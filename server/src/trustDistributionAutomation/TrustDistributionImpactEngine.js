/**
 * TrustDistributionImpactEngine.js
 * Evaluates impact of domain events and selects specific assets to regenerate.
 */
const dependencyGraph = require('./TrustDistributionDependencyGraph');

class TrustDistributionImpactEngine {
  analyzeImpact(eventType, payload = {}) {
    const affectedAssets = dependencyGraph.getAffectedAssets(eventType);

    const requiresQRRegeneration = affectedAssets.includes('QR_CODE');
    const requiresAssetRegeneration = affectedAssets.some((a) => ['TRUST_CARD', 'BADGE', 'CERTIFICATE', 'SOCIAL_CARD'].includes(a));
    const requiresCacheInvalidation = true;

    return {
      eventType,
      msmeId: payload.msmeId || null,
      affectedAssets,
      requiresQRRegeneration,
      requiresAssetRegeneration,
      requiresCacheInvalidation,
      analyzedAt: new Date().toISOString(),
    };
  }
}

module.exports = new TrustDistributionImpactEngine();
