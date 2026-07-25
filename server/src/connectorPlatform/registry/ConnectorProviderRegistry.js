/**
 * ConnectorProviderRegistry.js
 * Provider Registry managing supported connector categories, adapter instantiation,
 * capability discovery, and version tracking.
 */
const MockErpAdapter = require('../adapters/MockErpAdapter');
const MockCrmAdapter = require('../adapters/MockCrmAdapter');
const MockGovAdapter = require('../adapters/MockGovAdapter');
const { BUILTIN_PROVIDERS } = require('./builtinProviders');

const CONNECTOR_CATEGORIES = Object.freeze([
  'ERP',
  'CRM',
  'ACCOUNTING',
  'IDENTITY',
  'COMMUNICATION',
  'GENERIC',
  'GOVERNMENT',
  'PROCUREMENT',
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
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[ConnectorProviderRegistry] Registered Adapter: '${caps.providerName}' [${caps.providerCode}] Category: ${caps.category}`);
    }
  }

  /**
   * Get adapter instance by provider code
   */
  getAdapter(providerCode) {
    return this.providers.get(providerCode) || null;
  }

  /**
   * List all registered providers with full capabilities & metadata
   */
  listProviders(categoryFilter = null) {
    const result = [];
    const seenCodes = new Set();

    // 1. Built-in Enterprise Providers
    for (const prov of BUILTIN_PROVIDERS) {
      if (!categoryFilter || prov.category.toUpperCase() === categoryFilter.toUpperCase()) {
        result.push(prov);
        seenCodes.add(prov.providerCode);
      }
    }

    // 2. Active instantiated Adapters (e.g. mock or custom code adapters)
    for (const [code, adapter] of this.providers.entries()) {
      const caps = adapter.getCapabilities();
      if (!seenCodes.has(caps.providerCode)) {
        if (!categoryFilter || caps.category.toUpperCase() === categoryFilter.toUpperCase()) {
          result.push({
            providerCode: caps.providerCode,
            name: caps.providerName,
            category: caps.category,
            type: caps.category,
            description: caps.description || 'Enterprise integration adapter',
            version: caps.version || 'v1.0.0',
            status: 'ACTIVE',
            capabilities: caps.capabilities || [],
            supportedAuthMethods: caps.supportedAuthMethods || ['API_KEY'],
            supportedResources: caps.supportedResources || ['Data'],
            healthSupport: typeof adapter.healthCheck === 'function',
            webhookSupport: caps.webhookSupport || false,
            syncSupport: { enabled: true, modes: ['FULL', 'INCREMENTAL'] },
          });
          seenCodes.add(caps.providerCode);
        }
      }
    }

    return result;
  }

  /**
   * List supported connector categories
   */
  listCategories() {
    return Array.from(CONNECTOR_CATEGORIES);
  }
}

module.exports = new ConnectorProviderRegistry();
