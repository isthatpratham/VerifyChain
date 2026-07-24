/**
 * MockErpAdapter.js
 * Reference Mock Adapter Implementation for Enterprise ERP Systems (SAP, Tally, NetSuite).
 */
const BaseIntegrationAdapter = require('./BaseIntegrationAdapter');

class MockErpAdapter extends BaseIntegrationAdapter {
  constructor() {
    super('sap_s4hana_mock', 'Mock SAP S/4HANA ERP', 'ERP');
  }

  async connect(credentials = {}) {
    this.isConnected = true;
    return {
      success: true,
      status: 'CONNECTED',
      sessionToken: `erp_sess_${Date.now()}`,
    };
  }

  async testConnection(credentials = {}) {
    return {
      success: true,
      statusCode: 200,
      message: 'ERP API Endpoint Reachable',
      pingMs: 18,
    };
  }

  async syncData(syncType = 'INCREMENTAL', params = {}) {
    return {
      syncType,
      recordsProcessed: 15,
      recordsUpdated: 3,
      conflictsDetected: 0,
      timestamp: new Date().toISOString(),
      items: [
        { externalId: 'ERP-MSME-101', businessName: 'Apex Precision Tools', gstin: '27AABCA1234H1Z0', verified: true },
        { externalId: 'ERP-MSME-102', businessName: 'TechComponents India', gstin: '27BBCDA5678J2Z1', verified: true },
      ],
    };
  }
}

module.exports = MockErpAdapter;
