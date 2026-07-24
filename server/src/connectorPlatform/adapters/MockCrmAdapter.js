/**
 * MockCrmAdapter.js
 * Reference Mock Adapter Implementation for Enterprise CRM Systems (Salesforce, HubSpot).
 */
const BaseIntegrationAdapter = require('./BaseIntegrationAdapter');

class MockCrmAdapter extends BaseIntegrationAdapter {
  constructor() {
    super('salesforce_crm_mock', 'Mock Salesforce CRM', 'CRM');
  }

  async connect(credentials = {}) {
    this.isConnected = true;
    return { success: true, status: 'CONNECTED' };
  }

  async testConnection(credentials = {}) {
    return { success: true, statusCode: 200, message: 'CRM API Reachable', pingMs: 25 };
  }

  async syncData(syncType = 'INCREMENTAL', params = {}) {
    return {
      syncType,
      recordsProcessed: 20,
      recordsUpdated: 5,
      conflictsDetected: 1,
      timestamp: new Date().toISOString(),
      items: [
        { externalId: 'CRM-ACC-901', accountName: 'Apex Precision Tools', trustLevel: 'VERIFIED' },
      ],
    };
  }
}

module.exports = MockCrmAdapter;
