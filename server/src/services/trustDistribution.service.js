const trustDistributionIdentityRepository = require('../repositories/trustDistributionIdentity.repository');
const trustDistributionConfigRepository = require('../repositories/trustDistributionConfig.repository');
const trustDistributionTimelineRepository = require('../repositories/trustDistributionTimeline.repository');
const supplierTrustService = require('./supplierTrust.service');
const domainEventBus = require('../events/DomainEventBus');
const { distributionTokenEngine, qrCodeGeneratorEngine, verificationResolver } = require('../qrEngine');
const { trustAssetGenerator } = require('../assetEngine');

class TrustDistributionService {
  /**
   * Get public share link configuration and social metadata
   */
  async getShareLinkConfig(msmeId) {
    const profile = await supplierTrustService.getTrustProfileByMsmeId(msmeId);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const canonicalUrl = `${clientUrl}/verify/${profile.public_slug}`;

    domainEventBus.publish('ShareLinkCreated', {
      msmeId,
      profileId: profile.id,
      publicSlug: profile.public_slug,
    });

    return {
      canonicalUrl,
      publicSlug: profile.public_slug,
      socialShare: {
        title: `${profile.display_name} - Verified Supplier Trust Profile`,
        description: `Verified ${profile.trust_level} standing with a compliance rating of ${profile.trust_score_snapshot || 85}/100 on VerifyChain.`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`Verify ${profile.display_name} on VerifyChain: ${canonicalUrl}`)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonicalUrl)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(canonicalUrl)}&text=${encodeURIComponent(`Verified Supplier Profile for ${profile.display_name}`)}`,
      },
    };
  }

  /**
   * Get widget configuration and embed snippet
   */
  async getWidgetEmbedConfig(msmeId) {
    const profile = await supplierTrustService.getTrustProfileByMsmeId(msmeId);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const widgetUrl = `${clientUrl}/embed/widget/${profile.public_slug}`;

    const iframeCode = `<iframe src="${widgetUrl}" width="380" height="240" frameborder="0" scrolling="no" style="border: 0; border-radius: 12px; overflow: hidden;" title="${profile.display_name} VerifyChain Trust Widget"></iframe>`;

    domainEventBus.publish('WidgetEmbedded', {
      msmeId,
      profileId: profile.id,
    });

    return {
      widgetUrl,
      iframeCode,
      dimensions: { width: 380, height: 240 },
    };
  }

  /**
   * Get badge embed configuration snippet
   */
  async getBadgeEmbedConfig(msmeId) {
    const profile = await supplierTrustService.getTrustProfileByMsmeId(msmeId);
    const badgeObj = trustAssetGenerator.generateTrustBadge(profile, 'STANDARD');

    domainEventBus.publish('BadgeEmbedded', {
      msmeId,
      profileId: profile.id,
    });

    return {
      badgeSvg: badgeObj.svg,
      htmlCode: badgeObj.htmlCode,
    };
  }

  /**
   * Resolve deep-link parameters for public trust features
   */
  async resolveDeepLink(slug, section = 'overview') {
    const profile = await supplierTrustService.getTrustProfileBySlug(slug);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

    domainEventBus.publish('DeepLinkResolved', {
      slug,
      section,
    });

    return {
      slug,
      section,
      deepLinkUrl: `${clientUrl}/verify/${slug}#${section}`,
      profile,
    };
  }

  /**
   * Generate complete set of Trust Assets for an MSME
   */
  async generateTrustAssets(msmeId) {
    const profile = await supplierTrustService.getTrustProfileByMsmeId(msmeId);
    const qrResult = await this.generateQRCode(msmeId);

    const trustCard = trustAssetGenerator.generateTrustCard(profile, qrResult.qrDataUrl);
    const trustBadge = trustAssetGenerator.generateTrustBadge(profile, 'STANDARD');
    const socialCard = trustAssetGenerator.generateSocialCard(profile);
    const emailSignature = trustAssetGenerator.generateEmailSignatureAsset(profile);

    domainEventBus.publish('TrustAssetGenerated', {
      msmeId,
      profileId: profile.id,
      assetVersion: 'v1.0.0',
    });

    return {
      msmeId,
      assetVersion: 'v1.0.0',
      generatedAt: new Date().toISOString(),
      assets: {
        trustCard,
        trustBadge,
        socialCard,
        emailSignature,
        qrCode: qrResult,
      },
    };
  }

  /**
   * Generate Printable Trust Certificate PDF
   */
  async generateCertificatePDF(msmeId) {
    const profile = await supplierTrustService.getTrustProfileByMsmeId(msmeId);
    const pdfBuffer = await trustAssetGenerator.generateCertificatePDF(profile);

    domainEventBus.publish('CertificateGenerated', {
      msmeId,
      profileId: profile.id,
    });

    return pdfBuffer;
  }

  /**
   * Generate dynamic QR code asset and signed distribution token
   */
  async generateQRCode(msmeId) {
    const identity = await this.getOrCreateDistributionIdentity(msmeId);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

    // Issue signed distribution token
    const tokenObj = distributionTokenEngine.issueToken({
      stableDistributionId: identity.stable_distribution_id,
      publicSlug: identity.public_slug,
      expirationDays: 365,
    });

    const targetUrl = `${clientUrl}/verify/${identity.public_slug}?token=${encodeURIComponent(tokenObj.rawToken)}`;

    // Generate PNG Data URL and SVG vector string
    const [qrDataUrl, qrSvg] = await Promise.all([
      qrCodeGeneratorEngine.generateDataUrl(targetUrl),
      qrCodeGeneratorEngine.generateSVG(targetUrl),
    ]);

    // Log timeline event
    await trustDistributionTimelineRepository.create({
      trust_distribution_identity_id: identity.id,
      event_type: 'QR_GENERATED',
      title: 'Dynamic QR Verification Asset Generated',
      description: `Generated signed QR token ${tokenObj.tokenId} expiring at ${tokenObj.expiresAt}.`,
      actor: 'SYSTEM',
    });

    domainEventBus.publish('QRCodeGenerated', {
      identityId: identity.id,
      msmeId,
      tokenId: tokenObj.tokenId,
    });

    return {
      msmeId,
      identityId: identity.id,
      stableDistributionId: identity.stable_distribution_id,
      publicSlug: identity.public_slug,
      token: tokenObj,
      targetUrl,
      qrDataUrl,
      qrSvg,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Regenerate dynamic QR code token and graphic asset
   */
  async regenerateQRCode(msmeId) {
    const result = await this.generateQRCode(msmeId);

    domainEventBus.publish('QRCodeRegenerated', {
      identityId: result.identityId,
      msmeId,
      tokenId: result.token.tokenId,
    });

    return result;
  }

  /**
   * Revoke a QR code token
   */
  async revokeQRCodeToken(rawToken) {
    const result = distributionTokenEngine.revokeToken(rawToken);

    domainEventBus.publish('QRCodeRevoked', {
      rawToken,
    });

    return result;
  }

  /**
   * Resolve live QR code token verification
   */
  async resolveQRToken(rawToken) {
    return verificationResolver.resolveVerification(rawToken);
  }

  /**
   * Get or create canonical Trust Distribution Identity for an MSME.
   * Idempotent: safe to call repeatedly. On first creation, auto-generates
   * the initial QR code so the distribution workspace is immediately usable.
   */
  async getOrCreateDistributionIdentity(msmeId) {
    const trustProfile = await supplierTrustService.getOrCreateTrustProfile(msmeId);

    let distIdentity = await trustDistributionIdentityRepository.findBySupplierTrustProfileId(trustProfile.id);

    if (!distIdentity) {
      const stableId = `VC-DIST-${msmeId}-${Math.floor(1000 + Math.random() * 9000)}`;

      distIdentity = await trustDistributionIdentityRepository.create({
        supplier_trust_profile_id: trustProfile.id,
        public_slug: trustProfile.public_slug,
        stable_distribution_id: stableId,
        asset_version: 'v1.0.0',
        status: 'ACTIVE',
        enabled_channels: ['PUBLIC_LINK', 'QR_CODE', 'TRUST_CARD', 'CERTIFICATE', 'EMBED_BADGE', 'WIDGET'],
      });

      // Initial Distribution Configuration
      await trustDistributionConfigRepository.create({
        trust_distribution_identity_id: distIdentity.id,
        branding_json: { theme: 'LIGHT', accentColor: '#2563eb' },
        visibility_json: { publicScore: true, categoryStanding: true },
        token_policy_json: { signedAssets: true, ttlDays: 365 },
        expiration_days: 365,
      });

      // Initial Distribution Timeline Event
      await trustDistributionTimelineRepository.create({
        trust_distribution_identity_id: distIdentity.id,
        event_type: 'IDENTITY_CREATED',
        title: 'Trust Distribution Identity Established',
        description: `Stable distribution identifier ${stableId} registered for multi-channel broadcasting.`,
        actor: 'SYSTEM',
      });

      domainEventBus.publish(domainEventBus.EVENTS.DISTRIBUTION_IDENTITY_CREATED, {
        identityId: distIdentity.id,
        msmeId,
        stableId,
      });

      // Auto-generate first QR so the workspace is immediately usable (non-fatal)
      try {
        await this._generateQRForIdentity(distIdentity, msmeId);
      } catch (qrErr) {
        console.error(`[TrustDistributionService] Auto-QR generation failed on first init for MSME ${msmeId}:`, qrErr.message);
      }
    }

    return distIdentity;
  }

  /**
   * Internal helper: generate QR token and asset for a given identity record.
   * Extracted to be reusable from both getOrCreate and generateQRCode.
   */
  async _generateQRForIdentity(identity, msmeId) {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const tokenObj = distributionTokenEngine.issueToken({
      stableDistributionId: identity.stable_distribution_id,
      publicSlug: identity.public_slug,
      expirationDays: 365,
    });
    const targetUrl = `${clientUrl}/verify/${identity.public_slug}?token=${encodeURIComponent(tokenObj.rawToken)}`;
    const [qrDataUrl, qrSvg] = await Promise.all([
      qrCodeGeneratorEngine.generateDataUrl(targetUrl),
      qrCodeGeneratorEngine.generateSVG(targetUrl),
    ]);
    await trustDistributionTimelineRepository.create({
      trust_distribution_identity_id: identity.id,
      event_type: 'QR_GENERATED',
      title: 'Dynamic QR Verification Asset Generated',
      description: `Generated signed QR token ${tokenObj.tokenId} expiring at ${tokenObj.expiresAt}.`,
      actor: 'SYSTEM',
    });
    domainEventBus.publish('QRCodeGenerated', { identityId: identity.id, msmeId, tokenId: tokenObj.tokenId });
    return { token: tokenObj, targetUrl, qrDataUrl, qrSvg };
  }

  /**
   * Get Trust Distribution Configuration
   */
  async getDistributionConfiguration(identityId) {
    return trustDistributionConfigRepository.findByDistributionIdentityId(identityId);
  }

  /**
   * Get Trust Distribution Timeline Events
   */
  async getDistributionTimeline(identityId) {
    return trustDistributionTimelineRepository.findByIdentityId(identityId);
  }

  /**
   * Get Distribution Channel Specification Catalog
   */
  getDistributionChannelCatalog() {
    return {
      version: 'v1.0.0',
      supportedChannels: [
        { code: 'PUBLIC_LINK', name: 'Shareable Public Verification Link', status: 'AVAILABLE' },
        { code: 'QR_CODE', name: 'Dynamic Verification QR Code', status: 'AVAILABLE' },
        { code: 'TRUST_CARD', name: 'Digital Verified Supplier Card', status: 'AVAILABLE' },
        { code: 'CERTIFICATE', name: 'Printable Statutory Compliance Certificate', status: 'AVAILABLE' },
        { code: 'EMBED_BADGE', name: 'Embeddable HTML Trust Badge', status: 'AVAILABLE' },
        { code: 'WIDGET', name: 'Website Interactive Compliance Widget', status: 'AVAILABLE' },
        { code: 'MOBILE_WALLET', name: 'Digital Credentials Mobile Wallet Sync', status: 'PLANNED' },
      ],
    };
  }
}

module.exports = new TrustDistributionService();
