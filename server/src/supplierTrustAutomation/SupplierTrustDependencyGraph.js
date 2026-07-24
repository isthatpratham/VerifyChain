/**
 * SupplierTrustDependencyGraph.js
 * Dependency graph mapping business attributes, compliance events, and health scores
 * to trust policy criteria for selective trust re-evaluations.
 */

class SupplierTrustDependencyGraph {
  constructor() {
    this.EVENT_POLICY_MAP = {
      ScoreCalculated: ['ENTERPRISE_TRUSTED', 'HIGHLY_TRUSTED', 'TRUSTED', 'VERIFIED'],
      ComplianceStatusChanged: ['VERIFIED', 'SUSPENDED'],
      BusinessUpdated: ['VERIFIED', 'PENDING'],
      SupplierTrustProfileUpdated: ['TRUSTED', 'PUBLIC_PUBLISHED'],
    };

    this.SCORE_TRUST_LEVEL_MAP = {
      ENTERPRISE: 90,
      HIGHLY_TRUSTED: 80,
      TRUSTED: 70,
      VERIFIED: 50,
    };
  }

  /**
   * Determine affected trust policy checks based on triggering event
   */
  getAffectedPolicies(eventType) {
    return this.EVENT_POLICY_MAP[eventType] || ['VERIFIED', 'PENDING'];
  }

  /**
   * Graph overview
   */
  getGraphOverview() {
    return {
      eventPolicyMap: this.EVENT_POLICY_MAP,
      scoreThresholds: this.SCORE_TRUST_LEVEL_MAP,
    };
  }
}

module.exports = new SupplierTrustDependencyGraph();
