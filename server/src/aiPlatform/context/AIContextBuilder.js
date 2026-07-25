/**
 * AIContextBuilder.js
 * Unified AI Context Builder Aggregator.
 * Combines Business, Compliance, Trust, Developer Platform, and Audit contexts efficiently.
 */

const businessContextBuilder = require('./contextBuilders/BusinessContextBuilder');
const complianceContextBuilder = require('./contextBuilders/ComplianceContextBuilder');
const trustContextBuilder = require('./contextBuilders/TrustContextBuilder');
const developerPlatformContextBuilder = require('./contextBuilders/DeveloperPlatformContextBuilder');
const auditContextBuilder = require('./contextBuilders/AuditContextBuilder');

class AIContextBuilder {
  /**
   * Build combined, permission-aware context payload for LLM orchestration
   */
  async buildUnifiedContext({ msmeId = 1, userId = 'USER_1', scopes = ['*'], domains = ['BUSINESS', 'COMPLIANCE', 'TRUST'] }) {
    const context = {
      timestamp: new Date().toISOString(),
      msmeId: parseInt(msmeId, 10) || 1,
      userId: String(userId),
    };

    const targetDomains = Array.isArray(domains) ? domains.map((d) => d.toUpperCase()) : ['BUSINESS', 'COMPLIANCE', 'TRUST'];

    if (targetDomains.includes('ALL') || targetDomains.includes('BUSINESS')) {
      context.business = await businessContextBuilder.buildContext({ msmeId });
    }

    if (targetDomains.includes('ALL') || targetDomains.includes('COMPLIANCE')) {
      context.compliance = await complianceContextBuilder.buildContext({ msmeId });
    }

    if (targetDomains.includes('ALL') || targetDomains.includes('TRUST')) {
      context.trust = await trustContextBuilder.buildContext({ msmeId });
    }

    if (targetDomains.includes('ALL') || targetDomains.includes('DEVELOPER')) {
      context.developer = await developerPlatformContextBuilder.buildContext({ msmeId });
    }

    if (targetDomains.includes('ALL') || targetDomains.includes('AUDIT')) {
      context.audit = await auditContextBuilder.buildContext({ msmeId });
    }

    return context;
  }
}

module.exports = new AIContextBuilder();
