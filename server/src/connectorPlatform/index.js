/**
 * index.js
 * Master Facade for Third-Party Connector & Integration Adapter Framework Bounded Context (Phase 8.4).
 */

const BaseIntegrationAdapter = require('./adapters/BaseIntegrationAdapter');
const MockErpAdapter = require('./adapters/MockErpAdapter');
const MockCrmAdapter = require('./adapters/MockCrmAdapter');
const MockGovAdapter = require('./adapters/MockGovAdapter');
const ConnectorProviderRegistry = require('./registry/ConnectorProviderRegistry');
const ConnectionManager = require('./connection/ConnectionManager');
const DataMapper = require('./mapping/DataMapper');
const SynchronizationEngine = require('./sync/SynchronizationEngine');
const ConnectorHealthMonitor = require('./health/ConnectorHealthMonitor');
const ConnectorAuditService = require('./audit/ConnectorAuditService');

module.exports = {
  BaseIntegrationAdapter,
  MockErpAdapter,
  MockCrmAdapter,
  MockGovAdapter,
  ConnectorProviderRegistry,
  ConnectionManager,
  DataMapper,
  SynchronizationEngine,
  ConnectorHealthMonitor,
  ConnectorAuditService,
};
