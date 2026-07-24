const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { distributionTokenEngine, qrCodeGeneratorEngine } = require('../src/qrEngine');
const { trustAssetGenerator } = require('../src/assetEngine');
const { trustDistributionImpactEngine, trustDistributionDependencyGraph } = require('../src/trustDistributionAutomation');

describe('Phase 7 Trust Distribution Platform - Production Readiness Audit Suite', () => {
  describe('Distribution Token Engine & Security Audit', () => {
    test('Should issue a valid HMAC-SHA256 signed distribution token', () => {
      const tokenObj = distributionTokenEngine.issueToken({
        stableDistributionId: 'VC-DIST-101-9999',
        publicSlug: 'acme-corp',
        expirationDays: 30,
      });

      assert.ok(tokenObj.rawToken, 'rawToken should exist');
      assert.ok(tokenObj.tokenId, 'tokenId should exist');
      assert.equal(typeof tokenObj.signature, 'string', 'signature should be string');
      assert.equal(tokenObj.signature.length, 64, 'HMAC-SHA256 signature must be 64 hex chars');
    });

    test('Should verify signed token signature integrity', () => {
      const tokenObj = distributionTokenEngine.issueToken({
        stableDistributionId: 'VC-DIST-102-8888',
        publicSlug: 'beta-supplies',
      });

      const validation = distributionTokenEngine.validateToken(tokenObj.rawToken);
      assert.equal(validation.isValid, true, 'Token signature must be valid');
      assert.equal(validation.publicSlug, 'beta-supplies');
    });

    test('Should reject tampered token signatures', () => {
      const tokenObj = distributionTokenEngine.issueToken({
        stableDistributionId: 'VC-DIST-103-7777',
        publicSlug: 'gamma-ind',
      });

      const tamperedToken = `${tokenObj.rawToken}TAMPERED`;
      const validation = distributionTokenEngine.validateToken(tamperedToken);
      assert.equal(validation.isValid, false, 'Tampered token must be rejected');
      assert.equal(validation.reason, 'INVALID_SIGNATURE');
    });

    test('Should support manual token revocation', () => {
      const tokenObj = distributionTokenEngine.issueToken({
        stableDistributionId: 'VC-DIST-104-6666',
        publicSlug: 'delta-tech',
      });

      const revocationResult = distributionTokenEngine.revokeToken(tokenObj.rawToken);
      assert.equal(revocationResult.success, true);

      const validation = distributionTokenEngine.validateToken(tokenObj.rawToken);
      assert.equal(validation.isValid, false);
      assert.equal(validation.reason, 'TOKEN_REVOKED');
    });
  });

  describe('Dynamic QR Code Generator Engine', () => {
    test('Should generate valid PNG Data URL and SVG graphics', async () => {
      const targetUrl = 'http://localhost:3000/verify/acme-corp?token=test-token';
      const dataUrl = await qrCodeGeneratorEngine.generateDataUrl(targetUrl);
      const svg = await qrCodeGeneratorEngine.generateSVG(targetUrl);

      assert.ok(dataUrl.startsWith('data:image/png;base64,'), 'PNG DataURL must start with correct prefix');
      assert.ok(svg.includes('<svg'), 'SVG string must contain <svg root element');
    });
  });

  describe('Trust Asset Generation Engine', () => {
    const mockProfile = {
      display_name: 'Apex Precision Engineering',
      public_identifier: 'VC-TR-1001-9999',
      trust_level: 'ENTERPRISE_TRUSTED',
      trust_score_snapshot: 92,
      public_slug: 'apex-precision',
      verification_state: 'VERIFIED',
    };

    test('Should render SVG Digital Trust Card', () => {
      const card = trustAssetGenerator.generateTrustCard(mockProfile, 'data:image/png;base64,mockqr');
      assert.equal(card.type, 'TRUST_CARD');
      assert.ok(card.svg.includes('Apex Precision Engineering'));
      assert.ok(card.svg.includes('ENTERPRISE_TRUSTED'));
    });

    test('Should render Embeddable Trust Badge HTML and SVG', () => {
      const badge = trustAssetGenerator.generateTrustBadge(mockProfile, 'STANDARD');
      assert.equal(badge.type, 'TRUST_BADGE');
      assert.ok(badge.svg.includes('ENTERPRISE_TRUSTED'));
      assert.ok(badge.htmlCode.includes('<a href='));
    });

    test('Should render OpenGraph Social Share Card SVG', () => {
      const social = trustAssetGenerator.generateSocialCard(mockProfile);
      assert.equal(social.type, 'SOCIAL_SHARE_CARD');
      assert.ok(social.svg.includes('width="1200" height="630"'));
    });

    test('Should render Email Signature HTML snippet', () => {
      const emailSig = trustAssetGenerator.generateEmailSignatureAsset(mockProfile);
      assert.equal(emailSig.type, 'EMAIL_SIGNATURE');
      assert.ok(emailSig.htmlCode.includes('<table'));
    });

    test('Should generate high-res PDF Printable Certificate', async () => {
      const pdfBuffer = await trustAssetGenerator.generateCertificatePDF(mockProfile);
      assert.ok(Buffer.isBuffer(pdfBuffer), 'Certificate output must be a Buffer');
      assert.ok(pdfBuffer.length > 0, 'PDF Buffer must be non-empty');
    });
  });

  describe('Distribution Automation & Impact Engine', () => {
    test('Should calculate selective impact analysis for TrustLevelChanged', () => {
      const impact = trustDistributionImpactEngine.analyzeImpact('TrustLevelChanged', { msmeId: 'msme-101' });
      assert.ok(impact.affectedAssets.includes('TRUST_CARD'));
      assert.equal(impact.requiresAssetRegeneration, true);
    });

    test('Should resolve dependency graph mapping', () => {
      const assets = trustDistributionDependencyGraph.getAffectedAssets('QRCodeRevoked');
      assert.ok(assets.includes('QR_CODE'));
    });
  });
});
