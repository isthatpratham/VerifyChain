/**
 * BaseIntegrationAdapter.js
 * Base Abstract Class for all Third-Party Integration Adapters in VerifyChain.
 * Standardizes connection lifecycle, capability discovery, health monitoring, and data synchronization.
 */

class BaseIntegrationAdapter {
  constructor(providerCode, providerName, category) {
    if (new.target === BaseIntegrationAdapter) {
      throw new Error('BaseIntegrationAdapter is an abstract class and cannot be instantiated directly.');
    }
    this.providerCode = providerCode;
    this.providerName = providerName;
    this.category = category;
    this.isConnected = false;
  }

  /**
   * Return metadata and supported capabilities of this adapter
   */
  getCapabilities() {
    return {
      providerCode: this.providerCode,
      providerName: this.providerName,
      category: this.category,
      supportedSyncModes: ['FULL', 'INCREMENTAL', 'MANUAL'],
      supportedAuthTypes: ['API_KEY', 'BEARER_TOKEN'],
      readableResources: ['business_profile', 'compliance_record', 'trust_score'],
      writableResources: ['business_profile', 'verification_status'],
      supportsWebhooks: true,
      version: '1.0.0',
    };
  }

  /**
   * Authenticate and establish connection with external provider
   */
  async connect(credentials = {}) {
    throw new Error('Method connect() must be implemented by subclass.');
  }

  /**
   * Close connection and release external resources
   */
  async disconnect() {
    this.isConnected = false;
    return { success: true, message: `Disconnected from ${this.providerName}` };
  }

  /**
   * Test connection credentials and return health status
   */
  async testConnection(credentials = {}) {
    throw new Error('Method testConnection() must be implemented by subclass.');
  }

  /**
   * Synchronize data between VerifyChain and external provider
   * @param {string} syncType - 'FULL' | 'INCREMENTAL' | 'MANUAL'
   * @param {object} params - Options and payload
   */
  async syncData(syncType = 'INCREMENTAL', params = {}) {
    throw new Error('Method syncData() must be implemented by subclass.');
  }

  /**
   * Run health check and measure external API latency
   */
  async healthCheck() {
    const startTime = Date.now();
    try {
      const testResult = await this.testConnection({});
      const latencyMs = Date.now() - startTime;
      return {
        status: testResult.success ? 'HEALTHY' : 'UNHEALTHY',
        latencyMs,
        providerCode: this.providerCode,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      return {
        status: 'UNHEALTHY',
        latencyMs: Date.now() - startTime,
        error: err.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

module.exports = BaseIntegrationAdapter;
