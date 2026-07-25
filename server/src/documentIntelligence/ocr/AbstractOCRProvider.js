/**
 * AbstractOCRProvider.js
 * Base Abstract Contract for OCR Provider Adapters.
 * Decouples document extraction from specific vendor implementations (Google Vision, AWS Textract, Azure, Tesseract, Mock).
 */

class AbstractOCRProvider {
  constructor(providerCode) {
    if (this.constructor === AbstractOCRProvider) {
      throw new Error('AbstractOCRProvider cannot be instantiated directly.');
    }
    this.providerCode = providerCode;
  }

  /**
   * Process document file/buffer and return OCR layout & raw text
   * @param {Object} params - { fileBuffer, fileName, mimeType }
   * @returns {Promise<{ providerCode: string, rawText: string, pageCount: number, layoutBlocks: Array }>}
   */
  async extractText(params = {}) {
    throw new Error('Method extractText() must be implemented by OCR provider subclass.');
  }

  /**
   * Health check for provider status
   */
  async checkHealth() {
    return { providerCode: this.providerCode, status: 'HEALTHY' };
  }
}

module.exports = AbstractOCRProvider;
