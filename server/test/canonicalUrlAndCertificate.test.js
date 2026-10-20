const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const urlResolver = require('../src/utils/urlResolver');
const { trustAssetGenerator } = require('../src/assetEngine');

describe('Canonical URL Resolution & High-Resolution Certificate Verification Suite', () => {
  let envBackup;

  beforeEach(() => {
    envBackup = { ...process.env };
  });

  afterEach(() => {
    process.env = { ...envBackup };
  });

  describe('1. Canonical Public URL Resolution & Normalization', () => {
    test('Local development defaults to http://localhost:3000 when unconfigured', () => {
      delete process.env.CLIENT_URL;
      delete process.env.APP_URL;
      delete process.env.VERCEL_URL;
      delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
      process.env.NODE_ENV = 'development';

      const origin = urlResolver.getCanonicalClientUrl();
      assert.equal(origin, 'http://localhost:3000');
    });

    test('Normalizes explicit CLIENT_URL by stripping trailing slashes', () => {
      process.env.CLIENT_URL = 'https://verifychain.com///';
      process.env.NODE_ENV = 'production';

      const origin = urlResolver.getCanonicalClientUrl();
      assert.equal(origin, 'https://verifychain.com');
    });

    test('Accepts VERCEL_PROJECT_PRODUCTION_URL in production', () => {
      delete process.env.CLIENT_URL;
      delete process.env.APP_URL;
      process.env.VERCEL_PROJECT_PRODUCTION_URL = 'verifychain-prod.vercel.app';
      process.env.NODE_ENV = 'production';

      const origin = urlResolver.getCanonicalClientUrl();
      assert.equal(origin, 'https://verifychain-prod.vercel.app');
      assert.ok(!origin.includes('localhost'), 'Production origin must not contain localhost');
    });

    test('Accepts VERCEL_URL in preview deployments', () => {
      delete process.env.CLIENT_URL;
      delete process.env.APP_URL;
      delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
      process.env.VERCEL_URL = 'verifychain-git-preview-branch.vercel.app';
      process.env.NODE_ENV = 'production';

      const origin = urlResolver.getCanonicalClientUrl();
      assert.equal(origin, 'https://verifychain-git-preview-branch.vercel.app');
    });

    test('In production, throws descriptive error if canonical URL is missing (no localhost fallback)', () => {
      delete process.env.CLIENT_URL;
      delete process.env.APP_URL;
      delete process.env.VERCEL_URL;
      delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
      process.env.NODE_ENV = 'production';

      assert.throws(
        () => {
          urlResolver.getCanonicalClientUrl();
        },
        {
          name: 'Error',
          message: /Canonical public frontend origin.*must be configured in production/i,
        }
      );
    });

    test('In production, strictly rejects insecure http: origins', () => {
      process.env.CLIENT_URL = 'http://insecure-domain.com';
      process.env.NODE_ENV = 'production';

      assert.throws(
        () => {
          urlResolver.getCanonicalClientUrl();
        },
        {
          name: 'Error',
          message: /Insecure public application URL.*must use HTTPS/i,
        }
      );
    });

    test('Rejects malformed URL strings', () => {
      assert.throws(
        () => {
          urlResolver.normalizeUrl('not-a-valid-url');
        },
        {
          name: 'Error',
          message: /Malformed public application URL/i,
        }
      );
    });
  });

  describe('2. Trust Distribution Asset & Destination URL Builders', () => {
    beforeEach(() => {
      process.env.CLIENT_URL = 'https://trust.verifychain.com';
      process.env.NODE_ENV = 'production';
    });

    test('Constructs canonical public verification URL with encoded slug', () => {
      const url = urlResolver.resolveVerificationUrl('apex-precision-101');
      assert.equal(url, 'https://trust.verifychain.com/verify/apex-precision-101');
      assert.ok(!url.includes('localhost'));
    });

    test('Encodes signed QR token query parameter correctly', () => {
      const token = 'header.payload+with=special/chars.signature';
      const url = urlResolver.resolveVerificationUrl('apex-precision-101', token);
      assert.ok(url.startsWith('https://trust.verifychain.com/verify/apex-precision-101?token='));
      assert.ok(url.includes(encodeURIComponent(token)));
      assert.ok(!url.includes('localhost'));
    });

    test('Constructs website widget iframe URL and snippet with canonical origin', () => {
      const widgetUrl = urlResolver.resolveWidgetUrl('apex-precision-101');
      assert.equal(widgetUrl, 'https://trust.verifychain.com/embed/widget/apex-precision-101');

      const snippet = urlResolver.resolveWidgetIframeCode('apex-precision-101', 'Apex Precision Ltd.');
      assert.ok(snippet.includes('src="https://trust.verifychain.com/embed/widget/apex-precision-101"'));
      assert.ok(snippet.includes('Apex Precision Ltd. VerifyChain Trust Widget'));
      assert.ok(!snippet.includes('localhost'));
    });

    test('Constructs embeddable badge HTML pointing to canonical verification URL', () => {
      const svg = '<svg id="badge"></svg>';
      const badgeHtml = urlResolver.resolveBadgeHtmlCode('apex-precision-101', svg);
      assert.ok(badgeHtml.includes('href="https://trust.verifychain.com/verify/apex-precision-101"'));
      assert.ok(badgeHtml.includes(svg));
      assert.ok(!badgeHtml.includes('localhost'));
    });

    test('Constructs deep link URL with canonical origin and fragment', () => {
      const deepLink = urlResolver.resolveDeepLinkUrl('apex-precision-101', 'compliance');
      assert.equal(deepLink, 'https://trust.verifychain.com/verify/apex-precision-101#compliance');
      assert.ok(!deepLink.includes('localhost'));
    });
  });

  describe('3. CORS Policy & Allowed Origins', () => {
    test('Allows canonical client URL in production', () => {
      process.env.CLIENT_URL = 'https://verifychain.com';
      process.env.NODE_ENV = 'production';

      assert.equal(urlResolver.isAllowedOrigin('https://verifychain.com'), true);
      assert.equal(urlResolver.isAllowedOrigin('https://malicious-site.com'), false);
    });

    test('Rejects arbitrary localhost origins in production', () => {
      process.env.CLIENT_URL = 'https://verifychain.com';
      process.env.NODE_ENV = 'production';

      assert.equal(urlResolver.isAllowedOrigin('http://localhost:3000'), false);
      assert.equal(urlResolver.isAllowedOrigin('http://127.0.0.1:3000'), false);
    });

    test('Permits localhost in development and test environments', () => {
      delete process.env.CLIENT_URL;
      process.env.NODE_ENV = 'development';

      assert.equal(urlResolver.isAllowedOrigin('http://localhost:3000'), true);
      assert.equal(urlResolver.isAllowedOrigin('http://localhost:5173'), true);
      assert.equal(urlResolver.isAllowedOrigin('http://127.0.0.1:3000'), true);
    });

    test('Allows requests with no origin (curl / server-to-server / same-origin)', () => {
      assert.equal(urlResolver.isAllowedOrigin(undefined), true);
      assert.equal(urlResolver.isAllowedOrigin(''), true);
    });
  });

  describe('4. Genuine High-Resolution A4 PDF Certificate Generation', () => {
    const mockProfile = {
      display_name: 'Suplex Precision Components Pvt. Ltd.',
      public_identifier: 'VC-TR-1001-8492',
      public_slug: 'suplex-precision-components',
      trust_level: 'ENTERPRISE_TRUSTED',
      trust_score_snapshot: 94,
      verification_state: 'APPROVED',
      business_info: {
        sector: 'Automotive Components',
        state: 'Maharashtra',
        business_type: 'MANUFACTURING',
      },
    };

    test('Generates genuine PDF buffer with valid %PDF- file signature', async () => {
      process.env.CLIENT_URL = 'https://verifychain.com';

      const pdfBuffer = await trustAssetGenerator.generateCertificatePDF(mockProfile);

      assert.ok(Buffer.isBuffer(pdfBuffer), 'Certificate output must be a binary Buffer');
      assert.ok(pdfBuffer.length > 5000, `PDF size (${pdfBuffer.length} bytes) indicates complete graphical rendering`);

      // Verify the PDF magic number (%PDF-)
      const magicNumber = pdfBuffer.slice(0, 5).toString('ascii');
      assert.equal(magicNumber, '%PDF-', 'Certificate must have valid PDF magic file signature');
    });

    test('Handles missing profile metadata gracefully without failing', async () => {
      const minimalProfile = {
        public_slug: 'minimal-corp',
      };

      const pdfBuffer = await trustAssetGenerator.generateCertificatePDF(minimalProfile);
      assert.ok(Buffer.isBuffer(pdfBuffer));
      assert.equal(pdfBuffer.slice(0, 5).toString('ascii'), '%PDF-');
    });

    test('Embeds dynamic QR code and canonical production link into trust badge and email signature', () => {
      process.env.CLIENT_URL = 'https://trust.verifychain.com';
      process.env.NODE_ENV = 'production';

      const badge = trustAssetGenerator.generateTrustBadge(mockProfile, 'STANDARD');
      assert.ok(badge.htmlCode.includes('https://trust.verifychain.com/verify/suplex-precision-components'));
      assert.ok(!badge.htmlCode.includes('localhost'));

      const emailSig = trustAssetGenerator.generateEmailSignatureAsset(mockProfile);
      assert.ok(emailSig.htmlCode.includes('https://trust.verifychain.com/verify/suplex-precision-components'));
      assert.ok(!emailSig.htmlCode.includes('localhost'));
    });
  });
});
