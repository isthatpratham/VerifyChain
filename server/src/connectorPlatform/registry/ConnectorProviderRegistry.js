/**
 * ConnectorProviderRegistry.js
 * Provider Registry managing supported connector categories, adapter instantiation,
 * capability discovery, and version tracking.
 */
const MockErpAdapter = require('../adapters/MockErpAdapter');
const MockCrmAdapter = require('../adapters/MockCrmAdapter');
const MockGovAdapter = require('../adapters/MockGovAdapter');

const CONNECTOR_CATEGORIES = Object.freeze([
  'ERP',
  'CRM',
  'ACCOUNTING',
  'PROCUREMENT',
  'IDENTITY',
  'GOVERNMENT',
  'ANALYTICS',
  'BI',
  'STORAGE',
  'NOTIFICATION',
  'MOBILE',
  'PARTNER',
]);

class ConnectorProviderRegistry {
  constructor() {
    this.providers = new Map();
    this._initializePreRegisteredAdapters();
  }

  /**
   * Pre-register reference enterprise adapters
   */
  _initializePreRegisteredAdapters() {
    this.registerAdapter(new MockErpAdapter());
    this.registerAdapter(new MockCrmAdapter());
    this.registerAdapter(new MockGovAdapter());
  }

  /**
   * Register a new integration adapter instance
   */
  registerAdapter(adapterInstance) {
    const caps = adapterInstance.getCapabilities();
    this.providers.set(caps.providerCode, adapterInstance);
    console.log(`[ConnectorProviderRegistry] Registered Adapter: '${caps.providerName}' [${caps.providerCode}] Category: ${caps.category}`);
  }

  /**
   * Get adapter instance by provider code
   */
  getAdapter(providerCode) {
    return this.providers.get(providerCode) || null;
  }

  /**
   * List all registered providers with capabilities
   */
  listProviders(categoryFilter = null) {
    const list = [];
    for (const [code, adapter] of this.providers.entries()) {
      const caps = adapter.getCapabilities();
      if (!categoryFilter || caps.category.toUpperCase() === categoryFilter.toUpperCase()) {
        list.push(caps);
      }
    }
    return list;
  }

  /**
   * List supported connector categories
   */
  listCategories() {
    return Array.from(CONNECTOR_CATEGORIES);
  }
}

module.exports = new ConnectorProviderRegistry();
