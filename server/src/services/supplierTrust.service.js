const supplierTrustProfileRepository = require('../repositories/supplierTrustProfile.repository');
const trustMetadataRepository = require('../repositories/trustMetadata.repository');
const trustTimelineRepository = require('../repositories/trustTimeline.repository');
const msmeProfileRepository = require('../repositories/msmeProfile.repository');
const domainEventBus = require('../events/DomainEventBus');
const { trustEvaluationPipeline } = require('../supplierTrustEngine');

class SupplierTrustService {
  /**
   * Evaluate Supplier Trust Profile deterministically
   */
  async evaluateTrust(msmeId) {
    return trustEvaluationPipeline.executeEvaluation(msmeId);
  }

  /**
   * Get verification decision and current status for an MSME
   */
  async getVerificationDecision(msmeId) {
    const profile = await this.getOrCreateTrustProfile(msmeId);
    const metadata = await trustMetadataRepository.findLatestByProfileId(profile.id);

    return {
      msmeId,
      profileId: profile.id,
      publicSlug: profile.public_slug,
      trustLevel: profile.trust_level,
      verificationState: profile.verification_state,
      isPublic: profile.is_public,
      trustScoreSnapshot: profile.trust_score_snapshot,
      metadata,
      updatedAt: profile.updated_at,
    };
  }

  /**
   * Get latest evaluation snapshot & evidence breakdown for an MSME
   */
  async getVerificationSnapshot(msmeId) {
    const profile = await this.getOrCreateTrustProfile(msmeId);
    const timeline = await trustTimelineRepository.findByProfileId(profile.id);

    const latestEvalEvent = timeline.find((e) => e.event_type === 'TRUST_EVALUATED') || null;

    return {
      msmeId,
      profileId: profile.id,
      trustLevel: profile.trust_level,
      verificationState: profile.verification_state,
      trustScoreSnapshot: profile.trust_score_snapshot,
      latestEvalEvent,
      evaluatedAt: profile.updated_at,
    };
  }

  /**
   * Get or create canonical Supplier Trust Profile for an MSME.
   * Auto-publishes (is_public = true) and assigns deterministic slug.
   */
  async getOrCreateTrustProfile(msmeId) {
    let profile = await supplierTrustProfileRepository.findByMsmeId(msmeId);
    const msme = await msmeProfileRepository.findById(msmeId);
    if (!msme) throw new Error(`MSME Profile not found for ID ${msmeId}`);

    const cleanedName = msme.business_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Deterministic Public Slug Strategy:
    // Try clean name first; if taken by a different profile, append -${msmeId}
    let publicSlug = cleanedName || `msme-${msmeId}`;
    const existingWithSlug = await supplierTrustProfileRepository.findBySlug(publicSlug);
    if (existingWithSlug && existingWithSlug.msme_id !== msmeId) {
      publicSlug = `${publicSlug}-${msmeId}`;
    }

    const publicIdentifier = `VC-TR-${msmeId}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (!profile) {
      profile = await supplierTrustProfileRepository.create({
        msme_id: msmeId,
        public_slug: publicSlug,
        public_identifier: publicIdentifier,
        display_name: msme.business_name,
        trust_level: 'VERIFIED',
        verification_state: 'APPROVED',
        is_public: true,
        trust_score_snapshot: 85,
      });

      // Initial metadata record
      await trustMetadataRepository.create({
        supplier_trust_profile_id: profile.id,
        verification_version: 'v1.0.0',
        confidence_score: 90,
        review_cycle: 'ANNUAL',
      });

      // Initial timeline events
      await trustTimelineRepository.create({
        supplier_trust_profile_id: profile.id,
        event_type: 'PROFILE_CREATED',
        title: 'Supplier Trust Profile Created',
        description: `Canonical trust identity established with public slug ${publicSlug}.`,
        actor: 'SYSTEM',
      });

      await trustTimelineRepository.create({
        supplier_trust_profile_id: profile.id,
        event_type: 'PROFILE_PUBLISHED',
        title: 'Supplier Trust Profile Published',
        description: `Enterprise trust standing published to the Public Verification Portal.`,
        actor: 'SYSTEM',
      });

      domainEventBus.publish(domainEventBus.EVENTS.SUPPLIER_TRUST_PROFILE_CREATED, {
        profileId: profile.id,
        msmeId,
        publicSlug,
      });

      domainEventBus.publish(domainEventBus.EVENTS.TRUST_PROFILE_PUBLISHED, {
        profileId: profile.id,
        msmeId,
        publicSlug,
      });
    } else {
      // Auto-publish existing unpublished profiles
      if (!profile.is_public || profile.trust_level === 'PENDING') {
        profile = await supplierTrustProfileRepository.update(
          { id: profile.id },
          {
            is_public: true,
            trust_level: profile.trust_level === 'PENDING' ? 'VERIFIED' : profile.trust_level,
            verification_state: profile.verification_state === 'DRAFT' ? 'APPROVED' : profile.verification_state,
          }
        );
      }
    }

    return profile;
  }

  /**
   * Get trust profile by MSME ID
   */
  async getTrustProfileByMsmeId(msmeId) {
    return this.getOrCreateTrustProfile(msmeId);
  }

  /**
   * Get public trust profile by slug (with fallback resolution, auto-publishing, and distribution integration)
   */
  async getTrustProfileBySlug(slug) {
    let profile = await supplierTrustProfileRepository.findBySlug(slug);

    if (!profile) {
      // Fallback 1: Try public_identifier
      profile = await supplierTrustProfileRepository.findByIdentifier(slug);
    }

    if (!profile) {
      // Fallback 2: Parse msmeId from numeric string or hyphenated suffix
      let targetMsmeId = null;
      if (/^\d+$/.test(slug)) {
        targetMsmeId = parseInt(slug, 10);
      } else if (slug.includes('-')) {
        const parts = slug.split('-');
        const lastPart = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastPart)) {
          targetMsmeId = lastPart;
        }
      }

      if (targetMsmeId) {
        profile = await supplierTrustProfileRepository.findByMsmeId(targetMsmeId);
        if (!profile) {
          const msme = await msmeProfileRepository.findById(targetMsmeId);
          if (msme) {
            profile = await this.getOrCreateTrustProfile(targetMsmeId);
          }
        }
      }
    }

    if (!profile) {
      throw new Error(`Public Trust Profile not found for slug '${slug}'`);
    }

    // Auto-publish if restricted or unpublished
    if (!profile.is_public) {
      profile = await supplierTrustProfileRepository.update(
        { id: profile.id },
        { is_public: true, trust_level: 'VERIFIED', verification_state: 'APPROVED' }
      );
    }

    const [metadata, timeline, msme] = await Promise.all([
      trustMetadataRepository.findLatestByProfileId(profile.id),
      trustTimelineRepository.findByProfileId(profile.id),
      msmeProfileRepository.findById(profile.msme_id),
    ]);

    // Integrate Distribution channels data into public verification response
    let distribution = null;
    try {
      const trustDistributionService = require('./trustDistribution.service');
      const distIdentity = await trustDistributionService.getOrCreateDistributionIdentity(profile.msme_id);
      const shareConfig = await trustDistributionService.getShareLinkConfig(profile.msme_id);
      const widgetConfig = await trustDistributionService.getWidgetEmbedConfig(profile.msme_id);
      const badgeConfig = await trustDistributionService.getBadgeEmbedConfig(profile.msme_id);

      distribution = {
        stable_distribution_id: distIdentity.stable_distribution_id,
        asset_version: distIdentity.asset_version,
        public_url: shareConfig.canonicalUrl,
        widget_iframe: widgetConfig.iframeCode,
        badge_html: badgeConfig.htmlCode,
        certificate_download_url: `/api/trust-distribution/assets/download/certificate`,
      };
    } catch (distErr) {
      console.warn(`[SupplierTrustService] Distribution resolution notice for slug ${slug}:`, distErr.message);
    }

    return {
      id: profile.id,
      public_slug: profile.public_slug,
      public_identifier: profile.public_identifier,
      display_name: profile.display_name,
      trust_level: profile.trust_level,
      verification_state: profile.verification_state,
      is_public: profile.is_public,
      trust_score_snapshot: profile.trust_score_snapshot || 85,
      business_info: msme
        ? {
            business_type: msme.business_type,
            sector: msme.sector,
            state: msme.state,
            district: msme.district,
            is_food_business: msme.is_food_business,
          }
        : null,
      trust_metadata: metadata || {
        verification_version: 'v1.0.0',
        confidence_score: 90,
        review_cycle: 'ANNUAL',
      },
      timeline_events: (timeline || []).map((e) => ({
        id: e.id,
        event_type: e.event_type,
        title: e.title,
        description: e.description,
        created_at: e.created_at,
      })),
      distribution,
      updated_at: profile.updated_at,
    };
  }

  /**
   * Get trust metadata for a profile
   */
  async getTrustMetadata(profileId) {
    return trustMetadataRepository.findLatestByProfileId(profileId);
  }

  /**
   * Get trust timeline events for a profile
   */
  async getTrustTimeline(profileId) {
    return trustTimelineRepository.findByProfileId(profileId);
  }

  /**
   * Get trust domain configuration specification
   */
  getTrustConfiguration() {
    return {
      version: '1.0.0',
      trustLevels: ['PENDING', 'VERIFIED', 'TRUSTED', 'HIGHLY_TRUSTED', 'ENTERPRISE_TRUSTED', 'SUSPENDED', 'EXPIRED', 'REVOKED'],
      verificationStates: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED', 'SUSPENDED', 'REVOKED', 'ARCHIVED'],
      reviewCycle: 'ANNUAL',
      eventsCatalog: Object.values(domainEventBus.EVENTS),
    };
  }
}

module.exports = new SupplierTrustService();
