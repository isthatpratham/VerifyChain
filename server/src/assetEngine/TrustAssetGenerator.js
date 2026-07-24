/**
 * TrustAssetGenerator.js
 * Multi-format asset generator creating Digital Trust Cards, Printable Certificates,
 * Embeddable Trust Badges, Social Share Cards, and Email Signature Badges.
 */
const PDFDocument = require('pdfkit');
const trustBrandEngine = require('./TrustBrandEngine');

class TrustAssetGenerator {
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
   * Generate Printable Trust Certificate PDF Stream/Buffer
   */
  async generateCertificatePDF(profile = {}) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 40 });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      // Background & Borders
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#09090b');
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke('#10b981');
      doc.rect(25, 25, doc.page.width - 50, doc.page.height - 50).stroke('#27272a');

      // Title & Subtitle
      doc.fillColor('#10b981').fontSize(14).font('Helvetica-Bold').text('VERIFYCHAIN TRUST PLATFORM', 0, 70, { align: 'center' });
      doc.fillColor('#f4f4f5').fontSize(26).font('Helvetica-Bold').text('CERTIFICATE OF VERIFIED SUPPLIER STANDING', 0, 100, { align: 'center' });
      doc.fillColor('#a1a1aa').fontSize(12).font('Helvetica').text('This is to certify that the business enterprise listed below has undergone statutory compliance verification.', 0, 145, { align: 'center' });

      // Supplier Name & ID
      const name = profile.display_name || 'Verified Business Enterprise';
      doc.fillColor('#10b981').fontSize(28).font('Helvetica-Bold').text(name, 0, 210, { align: 'center' });
      doc.fillColor('#a1a1aa').fontSize(13).font('Helvetica').text(`Public Verification Identifier: ${profile.public_identifier || 'VC-TR-1001-0000'}`, 0, 250, { align: 'center' });

      // Status Box
      doc.fillColor('#f4f4f5').fontSize(14).font('Helvetica-Bold').text(`TRUST LEVEL: ${profile.trust_level || 'VERIFIED'}`, 0, 310, { align: 'center' });
      doc.fillColor('#a1a1aa').fontSize(11).font('Helvetica').text(`Compliance Health Rating: ${profile.trust_score_snapshot || 85} / 100`, 0, 335, { align: 'center' });

      // Footer Signatures & Date
      doc.fillColor('#71717a').fontSize(10).font('Helvetica').text(`Issued Date: ${new Date().toLocaleDateString('en-IN')}`, 60, 480);
      doc.fillColor('#71717a').fontSize(10).font('Helvetica').text('VerifyChain Automated Audit Authority', doc.page.width - 260, 480);

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
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

    const width = size === 'COMPACT' ? 180 : size === 'LARGE' ? 320 : 240;
    const height = size === 'COMPACT' ? 36 : size === 'LARGE' ? 60 : 44;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" rx="8" fill="#18181b" stroke="${brand.primaryColor}" stroke-width="1.5"/>
      <circle cx="20" cy="${height / 2}" r="6" fill="${brand.primaryColor}"/>
      <text x="34" y="${height / 2 + 4}" fill="${brand.textColorPrimary}" font-family="${brand.fontFamily}" font-size="${size === 'COMPACT' ? 11 : 13}" font-weight="bold">${level}</text>
      <text x="${width - 12}" y="${height / 2 + 4}" fill="${brand.textColorSecondary}" font-family="${brand.fontFamilyMono}" font-size="10" text-anchor="end">VerifyChain</text>
    </svg>`;

    const htmlCode = `<a href="${clientUrl}/verify/${slug}" target="_blank" rel="noopener noreferrer" title="Verify Supplier Standing on VerifyChain">
  ${svg}
</a>`;

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
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

    const htmlCode = `<table cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif; background: #09090b; border: 1px solid #27272a; border-radius: 8px; padding: 10px 14px; display: inline-block;">
  <tr>
    <td style="padding-right: 10px; color: ${brand.primaryColor}; font-weight: bold; font-size: 12px;">✔ ${level}</td>
    <td style="border-left: 1px solid #3f3f46; padding-left: 10px; font-size: 11px;">
      <a href="${clientUrl}/verify/${slug}" target="_blank" style="color: #a1a1aa; text-decoration: none;">Verify Standing on <strong>VerifyChain</strong> &rarr;</a>
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
