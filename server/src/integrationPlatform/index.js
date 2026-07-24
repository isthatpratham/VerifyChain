/**
 * index.js
 * Master Facade for Enterprise Integration Platform Bounded Context (Phase 8.1).
 * Exposes contracts, security, registry, audit, and observability modules.
 */

const { SCOPES, ALL_VALID_SCOPES, validateScopes, hasScope, hasAllScopes } = require('./contracts/ScopePermissions');
const { INTEGRATION_EVENTS, CONTRACT_VERSION, createEventPayload } = require('./contracts/EventContracts');
const ApiKeyManager = require('./security/ApiKeyManager');
const { encryptSecret, decryptSecret } = require('./security/SecretEncryption');
const IntegrationRegistry = require('./registry/IntegrationRegistry');
const IntegrationAuditService = require('./audit/IntegrationAuditService');
const IntegrationLogger = require('./observability/IntegrationLogger');

module.exports = {
  // Scope & Permission Contracts
  SCOPES,
  ALL_VALID_SCOPES,
  validateScopes,
  hasScope,
  hasAllScopes,

  // Versioned Event Contracts
  INTEGRATION_EVENTS,
  CONTRACT_VERSION,
  createEventPayload,

  // Security Infrastructure
  ApiKeyManager,
  encryptSecret,
  decryptSecret,

  // Registry & Infrastructure
  IntegrationRegistry,
  IntegrationAuditService,
  IntegrationLogger,
};
