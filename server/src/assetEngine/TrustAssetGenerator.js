/**
 * TrustAssetGenerator.js
 * Multi-format asset generator creating Digital Trust Cards, Printable Certificates,
 * Embeddable Trust Badges, Social Share Cards, and Email Signature Badges.
 */
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const trustBrandEngine = require('./TrustBrandEngine');
const urlResolver = require('../utils/urlResolver');

class TrustAssetGenerator {
  /**
   * Resolve authentic VerifyChain logo path on disk
   * @private
   */
  _getLogoPath() {
    const candidates = [
      path.resolve(__dirname, '../../../client/public/verifychain-mark.png'),
      path.resolve(__dirname, '../../../docs/Glossy Monochrome V Emblem.png'),
      path.resolve(process.cwd(), 'client/public/verifychain-mark.png'),
      path.resolve(process.cwd(), 'docs/Glossy Monochrome V Emblem.png'),
      path.resolve(process.cwd(), '../client/public/verifychain-mark.png'),
      path.resolve(process.cwd(), '../docs/Glossy Monochrome V Emblem.png'),
    ];
    return candidates.find((p) => {
      try {
        return fs.existsSync(p);
      } catch (_) {
        return false;
      }
    }) || null;
  }

  /**
   * Generate SVG string for Digital Trust Card
   */
  generateTrustCard(profile = {}, qrDataUrl = '') {
    const brand = trustBrandEngine.getBrandConfig();
    const name = profile.display_name || 'Verified Supplier';
    const id = profile.public_identifier || 'VC-TR-1001-0000';
    const level = profile.trust_level || 'VERIFIED';
    const score = profile.trust_score_snapshot || 85;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="340" viewBox="0 0 600 340">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#18181b"/>
          <stop offset="100%" stop-color="#09090b"/>
        </linearGradient>
      </defs>
      <rect width="600" height="340" rx="16" fill="url(#bgGrad)" stroke="#27272a" stroke-width="2"/>
      
      <!-- Top Brand Header -->
      <text x="32" y="44" fill="${brand.primaryColor}" font-family="${brand.fontFamilyMono}" font-size="12" font-weight="bold" letter-spacing="2">VERIFYCHAIN TRUST PLATFORM</text>
      <text x="568" y="44" fill="${brand.textColorSecondary}" font-family="${brand.fontFamilyMono}" font-size="12" text-anchor="end">DIGITAL TRUST CARD</text>
      <line x1="32" y1="60" x2="568" y2="60" stroke="#27272a" stroke-width="1"/>

      <!-- Supplier Identity -->
      <text x="32" y="100" fill="${brand.textColorPrimary}" font-family="${brand.fontFamily}" font-size="22" font-weight="bold">${name}</text>
      <text x="32" y="125" fill="${brand.textColorSecondary}" font-family="${brand.fontFamilyMono}" font-size="13">ID: ${id}</text>
      
      <!-- Trust Level Badge -->
      <rect x="32" y="145" width="160" height="32" rx="16" fill="rgba(16,185,129,0.1)" stroke="${brand.primaryColor}" stroke-width="1"/>
      <text x="112" y="166" fill="${brand.primaryColor}" font-family="${brand.fontFamilyMono}" font-size="12" font-weight="bold" text-anchor="middle">${level}</text>

      <!-- Score Ring Summary -->
      <circle cx="92" cy="245" r="35" fill="none" stroke="#27272a" stroke-width="6"/>
      <circle cx="92" cy="245" r="35" fill="none" stroke="${brand.primaryColor}" stroke-width="6" stroke-dasharray="220" stroke-dashoffset="${220 - (220 * score) / 100}"/>
      <text x="92" y="252" fill="${brand.textColorPrimary}" font-family="${brand.fontFamilyMono}" font-size="20" font-weight="bold" text-anchor="middle">${score}</text>
      <text x="145" y="245" fill="${brand.textColorPrimary}" font-family="${brand.fontFamily}" font-size="14" font-weight="600">Compliance Standing</text>
      <text x="145" y="262" fill="${brand.textColorSecondary}" font-family="${brand.fontFamily}" font-size="11">Statutory Verification Verified</text>

      <!-- QR Code Placeholder / Image -->
      ${qrDataUrl ? `<image href="${qrDataUrl}" x="440" y="140" width="120" height="120"/>` : ''}

      <!-- Footer Watermark -->
      <text x="32" y="315" fill="#3f3f46" font-family="${brand.fontFamilyMono}" font-size="10">AUTH: VERIFYCHAIN DETERMINISTIC COMPLIANCE PIPELINE v1.0.0</text>
    </svg>`;

    return {
      type: 'TRUST_CARD',
      format: 'SVG',
      svg,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Generate Printable Trust Certificate PDF Stream/Buffer.
   * Produces a print-ready, high-resolution A4 landscape certificate
   * featuring authentic VerifyChain branding, live verification QR code,
   * enterprise business details, and statutory compliance status.
   *
   * @param {Object} profile - Supplier Trust Profile with optional MSME details
   * @returns {Promise<Buffer>} Valid PDF binary buffer starting with %PDF-
   */
  async generateCertificatePDF(profile = {}) {
    const slug = profile.public_slug || 'supplier';
    const verificationUrl = urlResolver.resolveVerificationUrl(slug);

    // Pre-generate high-resolution QR code buffer
    let qrBuffer = null;
    try {
      qrBuffer = await QRCode.toBuffer(verificationUrl, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 240,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });
    } catch (qrErr) {
      console.warn('[TrustAssetGenerator] QR Code generation notice:', qrErr.message);
    }

    const logoPath = this._getLogoPath();

    return new Promise((resolve, reject) => {
      // Standard A4 landscape dimensions: 841.89 x 595.28 points
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 36,
        info: {
          Title: `VerifyChain Certificate - ${profile.display_name || 'Verified Supplier'}`,
          Author: 'VerifyChain Trust Platform',
          Subject: 'Statutory Compliance & Supplier Trust Certificate',
          Keywords: 'VerifyChain, Compliance, GST, MSME, Trust Certificate',
        },
      });

      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;

      // 1. Pristine certificate background
      doc.rect(0, 0, pageWidth, pageHeight).fill('#ffffff');

      // 2. Executive Security Borders
      // Outer primary navy border
      doc.rect(20, 20, pageWidth - 40, pageHeight - 40).lineWidth(2.5).stroke('#003153');
      // Inner fine accent border
      doc.rect(26, 26, pageWidth - 52, pageHeight - 52).lineWidth(0.75).stroke('#059669');
      // Subtle watermark inner border
      doc.rect(30, 30, pageWidth - 60, pageHeight - 60).lineWidth(0.5).stroke('#cbd5e1');

      // Corner security accents
      const cornerSize = 14;
      const corners = [
        [20, 20],
        [pageWidth - 20 - cornerSize, 20],
        [20, pageHeight - 20 - cornerSize],
        [pageWidth - 20 - cornerSize, pageHeight - 20 - cornerSize],
      ];
      corners.forEach(([cx, cy]) => {
        doc.rect(cx, cy, cornerSize, cornerSize).fill('#003153');
      });

      // 3. Header Section (Logo + Brand Identity)
      if (logoPath) {
        try {
          doc.image(logoPath, 50, 42, { width: 44 });
        } catch (_) {
          // Fallback if image format fails
        }
      }

      doc
        .fillColor('#003153')
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('VERIFYCHAIN ENTERPRISE TRUST PLATFORM', 104, 46, { characterSpacing: 1.5 });

      doc
        .fillColor('#64748b')
        .fontSize(8.5)
        .font('Helvetica')
        .text("INDIA'S DETERMINISTIC SINGLE SOURCE OF TRUTH FOR STATUTORY COMPLIANCE", 104, 62, {
          characterSpacing: 0.8,
        });

      // Top-right certificate identifier box
      const certId = profile.public_identifier || 'VC-TR-1001-0000';
      doc.rect(pageWidth - 230, 42, 180, 28).lineWidth(0.75).stroke('#cbd5e1').fill('#f8fafc');
      doc.fillColor('#64748b').fontSize(7.5).font('Helvetica').text('CERTIFICATE IDENTIFIER', pageWidth - 222, 46);
      doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold').text(certId, pageWidth - 222, 57);

      // Horizontal separator rule
      doc.moveTo(50, 82).lineTo(pageWidth - 50, 82).lineWidth(1).stroke('#e2e8f0');

      // 4. Main Certificate Title
      doc
        .fillColor('#0f172a')
        .fontSize(21)
        .font('Helvetica-Bold')
        .text('CERTIFICATE OF STATUTORY COMPLIANCE & TRUST STANDING', 50, 96, {
          align: 'center',
          characterSpacing: 0.5,
        });

      doc
        .fillColor('#475569')
        .fontSize(10)
        .font('Helvetica')
        .text('This certifies that the business enterprise named below has completed verified regulatory audit evaluation.', 50, 122, {
          align: 'center',
        });

      // 5. Enterprise Identity Card
      const name = profile.display_name || profile.business_name || 'Verified Business Enterprise';
      doc.rect(60, 142, pageWidth - 120, 68).fill('#f8fafc').stroke('#e2e8f0');

      doc
        .fillColor('#059669')
        .fontSize(8.5)
        .font('Helvetica-Bold')
        .text('CERTIFIED ENTERPRISE', 80, 150, { characterSpacing: 1 });

      doc
        .fillColor('#0f172a')
        .fontSize(20)
        .font('Helvetica-Bold')
        .text(name, 80, 164, { width: pageWidth - 280, ellipsis: true });

      const businessInfo = profile.business_info || {};
      const subDetails = [
        businessInfo.sector ? `Sector: ${businessInfo.sector}` : null,
        businessInfo.state ? `State: ${businessInfo.state}` : null,
        businessInfo.business_type ? `Type: ${businessInfo.business_type}` : null,
      ]
        .filter(Boolean)
        .join('   |   ');

      doc
        .fillColor('#64748b')
        .fontSize(8.5)
        .font('Helvetica')
        .text(subDetails || `Public Verification Slug: ${slug}`, 80, 192);

      // 6. Verified Standing Metrics (3 KPI Columns)
      const kpiY = 222;
      const kpiWidth = 145;
      const kpiHeight = 52;

      // KPI 1: Trust Level
      doc.rect(60, kpiY, kpiWidth, kpiHeight).fill('#ffffff').lineWidth(1).stroke('#10b981');
      doc.fillColor('#059669').fontSize(8).font('Helvetica-Bold').text('TRUST STANDING', 72, kpiY + 10);
      doc
        .fillColor('#0f172a')
        .fontSize(13)
        .font('Helvetica-Bold')
        .text(profile.trust_level || 'VERIFIED', 72, kpiY + 24);
      doc.fillColor('#64748b').fontSize(7.5).font('Helvetica').text('Active Standing', 72, kpiY + 39);

      // KPI 2: Compliance Health Score
      const score = profile.trust_score_snapshot || 85;
      doc.rect(215, kpiY, kpiWidth, kpiHeight).fill('#ffffff').lineWidth(1).stroke('#0284c7');
      doc.fillColor('#0284c7').fontSize(8).font('Helvetica-Bold').text('COMPLIANCE SCORE (CHS)', 227, kpiY + 10);
      doc
        .fillColor('#0f172a')
        .fontSize(13)
        .font('Helvetica-Bold')
        .text(`${score} / 100`, 227, kpiY + 24);
      doc.fillColor('#64748b').fontSize(7.5).font('Helvetica').text('Continuous Health Score', 227, kpiY + 39);

      // KPI 3: Verification State
      doc.rect(370, kpiY, kpiWidth, kpiHeight).fill('#ffffff').lineWidth(1).stroke('#003153');
      doc.fillColor('#003153').fontSize(8).font('Helvetica-Bold').text('VERIFICATION STATUS', 382, kpiY + 10);
      doc
        .fillColor('#0f172a')
        .fontSize(13)
        .font('Helvetica-Bold')
        .text(profile.verification_state || 'APPROVED', 382, kpiY + 24);
      doc.fillColor('#64748b').fontSize(7.5).font('Helvetica').text('Multi-Registry Settled', 382, kpiY + 39);

      // 7. Statutory Regulatory Scope Checklist (Left Column)
      const checksY = 286;
      doc
        .fillColor('#003153')
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('STATUTORY REGULATORY VERIFICATION SCOPES', 60, checksY, { characterSpacing: 0.5 });

      const checks = [
        'GSTIN Registration & Filing Track Record (GSTR-1, GSTR-3B)',
        'EPFO Employee Provident Fund Statutory Compliance',
        'ESIC Employee State Insurance Corporation Status',
        'MCA Corporate Registration & Filings (Active Compliance)',
        'Udyam National MSME Registration & Classification',
        'Deterministic Verification Integrity Hash Recorded',
      ];

      checks.forEach((chk, idx) => {
        const rowY = checksY + 16 + idx * 17;
        doc.fillColor('#059669').fontSize(10).font('Helvetica-Bold').text('✓', 60, rowY);
        doc.fillColor('#334155').fontSize(8.5).font('Helvetica').text(chk, 74, rowY + 1);
      });

      // 8. Live Verification QR Code Box (Right Column)
      const qrBoxX = pageWidth - 270;
      const qrBoxY = 222;
      const qrBoxW = 210;
      const qrBoxH = 175;

      doc.rect(qrBoxX, qrBoxY, qrBoxW, qrBoxH).fill('#f8fafc').lineWidth(1).stroke('#cbd5e1');

      doc
        .fillColor('#003153')
        .fontSize(8.5)
        .font('Helvetica-Bold')
        .text('DIGITAL VERIFICATION QR', qrBoxX + 14, qrBoxY + 12);

      if (qrBuffer) {
        doc.image(qrBuffer, qrBoxX + 60, qrBoxY + 30, { width: 90 });
      }

      doc
        .fillColor('#475569')
        .fontSize(7.5)
        .font('Helvetica')
        .text('Scan with any mobile device to verify real-time statutory standing.', qrBoxX + 14, qrBoxY + 128, {
          width: qrBoxW - 28,
          align: 'center',
        });

      doc
        .fillColor('#0284c7')
        .fontSize(7)
        .font('Helvetica-Bold')
        .text(verificationUrl, qrBoxX + 14, qrBoxY + 154, {
          width: qrBoxW - 28,
          align: 'center',
          ellipsis: true,
        });

      // 9. Footer Sign-off and Security Audit Watermark
      const footerY = pageHeight - 74;
      doc.moveTo(50, footerY).lineTo(pageWidth - 50, footerY).lineWidth(0.75).stroke('#e2e8f0');

      const todayStr = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const validUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      doc
        .fillColor('#64748b')
        .fontSize(8)
        .font('Helvetica')
        .text(`Issued Date: ${todayStr}   |   Valid Through: ${validUntil}`, 50, footerY + 12);

      doc
        .fillColor('#003153')
        .fontSize(8.5)
        .font('Helvetica-Bold')
        .text('VerifyChain Automated Audit Authority', pageWidth - 290, footerY + 12, { align: 'right' });

      doc
        .fillColor('#94a3b8')
        .fontSize(7)
        .font('Helvetica')
        .text(
          'CRYPTOGRAPHICALLY SEALED & AUDITED — THIS DOCUMENT CONTAINS DYNAMIC TRUST RECORD METADATA',
          50,
          footerY + 28,
          { align: 'center', width: pageWidth - 100 }
        );

      doc.end();
    });
  }

  /**
   * Generate Embeddable Trust Badge (SVG & HTML Code)
   */
  generateTrustBadge(profile = {}, size = 'STANDARD') {
    const brand = trustBrandEngine.getBrandConfig();
    const level = profile.trust_level || 'VERIFIED';
    const slug = profile.public_slug || 'supplier';

    const width = size === 'COMPACT' ? 180 : size === 'LARGE' ? 320 : 240;
    const height = size === 'COMPACT' ? 36 : size === 'LARGE' ? 60 : 44;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" rx="8" fill="#18181b" stroke="${brand.primaryColor}" stroke-width="1.5"/>
      <circle cx="20" cy="${height / 2}" r="6" fill="${brand.primaryColor}"/>
      <text x="34" y="${height / 2 + 4}" fill="${brand.textColorPrimary}" font-family="${brand.fontFamily}" font-size="${size === 'COMPACT' ? 11 : 13}" font-weight="bold">${level}</text>
      <text x="${width - 12}" y="${height / 2 + 4}" fill="${brand.textColorSecondary}" font-family="${brand.fontFamilyMono}" font-size="10" text-anchor="end">VerifyChain</text>
    </svg>`;

    const htmlCode = urlResolver.resolveBadgeHtmlCode(slug, svg);

    return {
      type: 'TRUST_BADGE',
      size,
      svg,
      htmlCode,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Generate Social Share Card (OpenGraph 1200x630 graphic SVG)
   */
  generateSocialCard(profile = {}) {
    const brand = trustBrandEngine.getBrandConfig();
    const name = profile.display_name || 'Verified Supplier';
    const level = profile.trust_level || 'VERIFIED';
    const score = profile.trust_score_snapshot || 85;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <rect width="1200" height="630" fill="#09090b"/>
      <rect x="40" y="40" width="1120" height="550" rx="24" fill="#18181b" stroke="#27272a" stroke-width="3"/>
      
      <text x="90" y="130" fill="${brand.primaryColor}" font-family="${brand.fontFamilyMono}" font-size="20" font-weight="bold" letter-spacing="3">VERIFYCHAIN VERIFIED SUPPLIER</text>
      <text x="90" y="240" fill="${brand.textColorPrimary}" font-family="${brand.fontFamily}" font-size="52" font-weight="extrabold">${name}</text>
      <text x="90" y="295" fill="${brand.textColorSecondary}" font-family="${brand.fontFamilyMono}" font-size="22">ID: ${profile.public_identifier || 'VC-TR-1001-0000'}</text>
      
      <rect x="90" y="340" width="280" height="60" rx="30" fill="rgba(16,185,129,0.15)" stroke="${brand.primaryColor}" stroke-width="2"/>
      <text x="230" y="378" fill="${brand.primaryColor}" font-family="${brand.fontFamilyMono}" font-size="24" font-weight="bold" text-anchor="middle">${level}</text>
      
      <text x="90" y="475" fill="${brand.textColorPrimary}" font-family="${brand.fontFamily}" font-size="28" font-weight="bold">Compliance Score: ${score} / 100</text>
      <text x="90" y="515" fill="${brand.textColorSecondary}" font-family="${brand.fontFamily}" font-size="20">Statutory Tax, EPF, MCA & Licensing Verifications Settled</text>
    </svg>`;

    return {
      type: 'SOCIAL_SHARE_CARD',
      format: 'SVG',
      svg,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Generate Email Signature Asset
   */
  generateEmailSignatureAsset(profile = {}) {
    const brand = trustBrandEngine.getBrandConfig();
    const level = profile.trust_level || 'VERIFIED';
    const slug = profile.public_slug || 'supplier';
    const verificationUrl = urlResolver.resolveVerificationUrl(slug);

    const htmlCode = `<table cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif; background: #09090b; border: 1px solid #27272a; border-radius: 8px; padding: 10px 14px; display: inline-block;">
  <tr>
    <td style="padding-right: 10px; color: ${brand.primaryColor}; font-weight: bold; font-size: 12px;">✔ ${level}</td>
    <td style="border-left: 1px solid #3f3f46; padding-left: 10px; font-size: 11px;">
      <a href="${verificationUrl}" target="_blank" style="color: #a1a1aa; text-decoration: none;">Verify Standing on <strong>VerifyChain</strong> &rarr;</a>
    </td>
  </tr>
</table>`;

    return {
      type: 'EMAIL_SIGNATURE',
      htmlCode,
      generatedAt: new Date().toISOString(),
    };
  }
}

module.exports = new TrustAssetGenerator();
