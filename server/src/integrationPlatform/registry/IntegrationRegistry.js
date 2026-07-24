/**
 * IntegrationRegistry.js
 * Central Integration Registry infrastructure for registered providers,
 * capabilities, features, versioning, and health checking.
 */

class IntegrationRegistry {
  constructor() {
    this.providers = new Map();
    this.registerSystemCapabilities();
  }

  /**
   * Pre-register core system integration provider templates for future pluggability
   */
  registerSystemCapabilities() {
    const defaultTemplates = [
      {
        providerCode: 'sap_s4hana',
        name: 'SAP S/4HANA Enterprise Integration',
        type: 'ERP',
        version: 'v1.0.0',
        capabilities: ['COMPLIANCE_SYNC', 'VENDOR_VERIFICATION', 'STRENGTH_AUDIT'],
        supportedFeatures: ['BULK_AUDIT', 'AUTO_DISCOVERY', 'REALTIME_HEALTH'],
        status: 'DRAFT',
      },
      {
        providerCode: 'tally_prime',
        name: 'Tally Prime MSME Accounting Bridge',
        type: 'ERP',
        version: 'v1.0.0',
        capabilities: ['GST_INVOICE_SYNC', 'TAX_FILING_AUDIT'],
        supportedFeatures: ['OFFLINE_SYNC', 'LOCAL_BRIDGE'],
        status: 'DRAFT',
      },
      {
        providerCode: 'salesforce_crm',
        name: 'Salesforce CRM Supplier Verification',
        type: 'CRM',
        version: 'v1.0.0',
        capabilities: ['SUPPLIER_TRUST_ENRICHMENT', 'BUYER_DIRECTORY_SYNC'],
        supportedFeatures: ['WEBHOOK_PUSH', 'LIGHTNING_WIDGET'],
        status: 'DRAFT',
      },
      {
        providerCode: 'gst_portal_gov',
        name: 'GSTN Government Verification Portal',
        type: 'GOVERNMENT',
        version: 'v1.0.0',
        capabilities: ['STATUTORY_STATUS_CHECK', 'FILING_AUDIT_SYNC'],
        supportedFeatures: ['E_WAY_BILL_AUDIT', 'GSTR_MATCHING'],
        status: 'DRAFT',
      },
      {
        providerCode: 'custom_webhook',
        name: 'Custom Enterprise Webhook Engine',
        type: 'WEBHOOK',
        version: 'v1.0.0',
        capabilities: ['EVENT_STREAMING', 'REALTIME_NOTIFICATIONS'],
        supportedFeatures: ['HMAC_SIGNATURE', 'RETRY_EXPONENTIAL_BACKOFF'],
        status: 'ACTIVE',
      },
    ];

    for (const tpl of defaultTemplates) {
      this.registerProviderCapability(tpl);
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
