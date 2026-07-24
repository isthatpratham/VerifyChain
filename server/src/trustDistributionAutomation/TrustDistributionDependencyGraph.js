/**
 * TrustDistributionDependencyGraph.js
 * Dependency graph mapping domain event types to affected trust distribution channels and assets.
 */

class TrustDistributionDependencyGraph {
  constructor() {
    this.EVENT_CHANNEL_MAP = {
      TrustLevelChanged: ['TRUST_CARD', 'BADGE', 'WIDGET', 'PUBLIC_LINK', 'SOCIAL_CARD'],
      TrustProfileUpdated: ['TRUST_CARD', 'BADGE', 'CERTIFICATE', 'PUBLIC_LINK'],
      QRCodeRevoked: ['QR_CODE', 'TRUST_CARD'],
      BrandConfigurationUpdated: ['TRUST_CARD', 'BADGE', 'CERTIFICATE', 'SOCIAL_CARD'],
    };
  }

  /**
   * Resolve affected asset types based on event type
   */
  getAffectedAssets(eventType) {
    return this.EVENT_CHANNEL_MAP[eventType] || ['PUBLIC_LINK', 'WIDGET'];
  }

  /**
   * Get dependency graph overview
   */
  getGraphOverview() {
    return {
      eventChannelMap: this.EVENT_CHANNEL_MAP,
    };
  }
}

module.exports = new TrustDistributionDependencyGraph();
