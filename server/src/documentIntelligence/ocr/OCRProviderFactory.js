/**
 * OCRProviderFactory.js
 * Configurable Resolution Manager for OCR Engine Adapters.
 */

const MockOCRProvider = require('./MockOCRProvider');

class OCRProviderFactory {
  constructor() {
    this.providers = new Map();
    this.registerProvider(new MockOCRProvider());
    this.defaultProviderCode = 'MOCK_OCR';
  }

  registerProvider(providerInstance) {
    this.providers.set(providerInstance.providerCode, providerInstance);
  }

  getProvider(providerCode) {
    const targetCode = providerCode || this.defaultProviderCode;
    return this.providers.get(targetCode) || this.providers.get(this.defaultProviderCode);
  }

  listProviders() {
    return Array.from(this.providers.keys());
  }
}

module.exports = new OCRProviderFactory();
