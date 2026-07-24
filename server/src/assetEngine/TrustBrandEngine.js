/**
 * TrustBrandEngine.js
 * Centralized brand engine providing themes, typography tokens, accent colors,
 * watermarks, and spacing configurations for trust asset rendering.
 */

class TrustBrandEngine {
  constructor() {
    this.DEFAULT_BRAND = {
      version: 'v1.0.0',
      brandName: 'VerifyChain Trust Platform',
      primaryColor: '#10b981', // Emerald 500
      secondaryColor: '#3b82f6', // Blue 500
      backgroundColor: '#09090b', // Neutral 950
      surfaceColor: '#18181b', // Neutral 900
      textColorPrimary: '#f4f4f5', // Neutral 100
      textColorSecondary: '#a1a1aa', // Neutral 400
      fontFamily: 'Inter, system-ui, sans-serif',
      fontFamilyMono: 'JetBrains Mono, monospace',
      watermarkText: 'VERIFYCHAIN VERIFIED SUPPLIER IDENTITY',
      badgeBorderRadius: '8px',
    };
  }

  getBrandConfig(customOverlays = {}) {
    return {
      ...this.DEFAULT_BRAND,
      ...customOverlays,
    };
  }
}

module.exports = new TrustBrandEngine();
