/**
 * QRCodeGeneratorEngine.js
 * Dynamic QR asset generator producing high-resolution SVG, PNG Data URLs,
 * and print-quality QR code graphics.
 */
const QRCode = require('qrcode');

class QRCodeGeneratorEngine {
  /**
   * Generate Data URL (Base64 PNG) for QR Code
   */
  async generateDataUrl(targetUrl, options = {}) {
    const defaultOpts = {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 2,
      color: {
        dark: '#10b981', // Emerald brand accent
        light: '#09090b', // Dark surface background
      },
      width: options.width || 300,
    };

    return QRCode.toDataURL(targetUrl, { ...defaultOpts, ...options });
  }

  /**
   * Generate SVG vector string for high-resolution print assets
   */
  async generateSVG(targetUrl, options = {}) {
    const defaultOpts = {
      errorCorrectionLevel: 'H',
      margin: 2,
      color: {
        dark: '#10b981',
        light: '#09090b',
      },
      width: options.width || 400,
    };

    return QRCode.toString(targetUrl, { ...defaultOpts, type: 'svg', ...options });
  }
}

module.exports = new QRCodeGeneratorEngine();
