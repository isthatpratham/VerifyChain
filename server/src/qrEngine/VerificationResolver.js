/**
 * VerificationResolver.js
 * Resolves QR verification tokens live against canonical Supplier Trust Profiles
 * and current compliance standing without hardcoding payload attributes into the QR image.
 */
const distributionTokenEngine = require('./DistributionTokenEngine');
const supplierTrustService = require('../services/supplierTrust.service');
const domainEventBus = require('../events/DomainEventBus');

class VerificationResolver {
  async resolveVerification(rawToken) {
    const tokenValidation = distributionTokenEngine.validateToken(rawToken);

    if (!tokenValidation.isValid) {
      domainEventBus.publish(domainEventBus.EVENTS.VERIFICATION_FAILED || 'VerificationFailed', {
        rawToken,
        reason: tokenValidation.reason,
      });

      return {
        isResolved: false,
        status: 'FAILED',
        reason: tokenValidation.reason,
      };
    }

    const { publicSlug, stableDistributionId } = tokenValidation;

    // Fetch live Supplier Trust Profile
    const profile = await supplierTrustService.getTrustProfileBySlug(publicSlug);

    const isAuthorized = profile.trust_level !== 'SUSPENDED' && profile.trust_level !== 'REVOKED';

    domainEventBus.publish(domainEventBus.EVENTS.VERIFICATION_RESOLVED || 'VerificationResolved', {
      publicSlug,
      stableDistributionId,
      trustLevel: profile.trust_level,
    });

    return {
      isResolved: true,
      status: isAuthorized ? 'VERIFIED' : 'SUSPENDED',
      stableDistributionId,
      publicSlug,
      trustProfile: {
        display_name: profile.display_name,
        public_identifier: profile.public_identifier,
        trust_level: profile.trust_level,
        verification_state: profile.verification_state,
        trust_score_snapshot: profile.trust_score_snapshot,
        business_info: profile.business_info,
        trust_metadata: profile.trust_metadata,
      },
      verifiedAt: new Date().toISOString(),
    };
  }
}

module.exports = new VerificationResolver();
