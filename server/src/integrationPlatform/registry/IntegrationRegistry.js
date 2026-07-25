/**
 * IntegrationRegistry.js
 * Central Integration Registry infrastructure for registered providers,
 * capabilities, features, versioning, and health checking.
 */
const { BUILTIN_PROVIDERS } = require('../../connectorPlatform/registry/builtinProviders');

class IntegrationRegistry {
  constructor() {
    this.providers = new Map();
    this.registerSystemCapabilities();
  }

  /**
   * Pre-register core system integration provider templates for future pluggability
   */
  registerSystemCapabilities() {
    // 1. Register 17 built-in production enterprise providers
    for (const prov of BUILTIN_PROVIDERS) {
      this.registerProviderCapability({
        providerCode: prov.providerCode,
        name: prov.name,
        type: prov.type,
        category: prov.category,
        version: prov.version,
        capabilities: prov.capabilities,
        supportedFeatures: Object.keys(prov.featureFlags || {}),
        status: prov.status,
        logo: prov.logo,
        docUrl: prov.docUrl,
      });
    }

    // 2. Register legacy aliases for backwards compatibility
    const legacyAliases = [
      { providerCode: 'sap_s4hana', targetCode: 'SAP_ERP' },
      { providerCode: 'tally_prime', targetCode: 'TALLY_PRIME' },
      { providerCode: 'salesforce_crm', targetCode: 'SALESFORCE_CRM' },
      { providerCode: 'gst_portal_gov', targetCode: 'GSTIN_GOV_PORTAL' },
      { providerCode: 'custom_webhook', targetCode: 'WEBHOOKS' },
      { providerCode: 'sap_s4hana_mock', targetCode: 'SAP_ERP' },
      { providerCode: 'salesforce_crm_mock', targetCode: 'SALESFORCE_CRM' },
      { providerCode: 'gstin_gov_portal_mock', targetCode: 'GSTIN_GOV_PORTAL' },
    ];

    for (const alias of legacyAliases) {
      const target = this.providers.get(alias.targetCode);
      if (target && !this.providers.has(alias.providerCode)) {
        this.providers.set(alias.providerCode, {
          ...target,
          providerCode: alias.providerCode,
          registeredAt: new Date().toISOString(),
        });
      }
    }
  }

  /**
   * Register a new integration provider capability template
   */
  registerProviderCapability(providerMeta) {
    if (!providerMeta || !providerMeta.providerCode) {
      throw new Error('Provider metadata must include a valid providerCode.');
    }
    this.providers.set(providerMeta.providerCode, {
      ...providerMeta,
      registeredAt: new Date().toISOString(),
    });
  }

  /**
   * Get metadata for a registered provider
   */
  getProviderCapability(providerCode) {
    return this.providers.get(providerCode) || null;
  }

  /**
   * List all registered integration provider capability templates
   */
  listSupportedCapabilities() {
    return Array.from(this.providers.values());
  }

  /**
   * Check if a provider code is recognized and supported
   */
  validateIntegrationSupport(providerCode) {
    return this.providers.has(providerCode);
  }
}

module.exports = new IntegrationRegistry();
