/**
 * index.js
 * Entry Point for Enterprise Document Vault Bounded Context (Phase 10.1).
 */

const DocumentVaultFacade = require('./application/DocumentVaultFacade');
const VaultAsset = require('./domain/VaultAsset');
const { VAULT_STATUSES } = require('./domain/VaultStatus');
const { VAULT_CATEGORIES } = require('./domain/VaultCategory');
const StorageProviderFactory = require('./storage/StorageProviderFactory');
const VersionManager = require('./versioning/VersionManager');
const MetadataEvolutionEngine = require('./versioning/MetadataEvolutionEngine');
const VersionComparisonEngine = require('./versioning/VersionComparisonEngine');
const VersionTimelineService = require('./versioning/VersionTimelineService');
const RollbackManager = require('./versioning/RollbackManager');
const DocumentLineageService = require('./versioning/DocumentLineageService');

module.exports = {
  DocumentVault: DocumentVaultFacade,
  VaultAsset,
  VAULT_STATUSES,
  VAULT_CATEGORIES,
  StorageProviderFactory,
  VersionManager,
  MetadataEvolutionEngine,
  VersionComparisonEngine,
  VersionTimelineService,
  RollbackManager,
  DocumentLineageService,
};
