/**
 * MockGovAdapter.js
 * Reference Mock Adapter Implementation for Government Statutory Systems (GST Portal, Udyam, Income Tax).
 */
const BaseIntegrationAdapter = require('./BaseIntegrationAdapter');

class MockGovAdapter extends BaseIntegrationAdapter {
  constructor() {
    super('gst_portal_gov_mock', 'Mock GST Portal India', 'GOVERNMENT');
  }

  async connect(credentials = {}) {
    this.isConnected = true;
    return { success: true, status: 'CONNECTED' };
  }

  async testConnection(credentials = {}) {
    return { success: true, statusCode: 200, message: 'GST Portal Gateway Operational', pingMs: 42 };
  }

  async syncData(syncType = 'INCREMENTAL', params = {}) {
    return {
      syncType,
      recordsProcessed: 50,
      recordsUpdated: 10,
      conflictsDetected: 0,
      timestamp: new Date().toISOString(),
      items: [
        { gstin: '27AABCA1234H1Z0', filingStatus: 'ACTIVE', lastReturnDate: '2026-06-30' },
      ],
    };
  }
}

module.exports = MockGovAdapter;
