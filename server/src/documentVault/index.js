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

const FolderService = require('./organization/FolderService');
const CollectionService = require('./organization/CollectionService');
const TagService = require('./organization/TagService');
const ClassificationService = require('./organization/ClassificationService');
const RecentActivityService = require('./organization/RecentActivityService');
const SavedSearchService = require('./organization/SavedSearchService');
const BulkOperationsService = require('./organization/BulkOperationsService');
const SearchEngine = require('./search/SearchEngine');

const VaultPermissionEngine = require('./collaboration/VaultPermissionEngine');
const SharingService = require('./collaboration/SharingService');
const CommentService = require('./collaboration/CommentService');
const DocumentWatchService = require('./collaboration/DocumentWatchService');
const ReviewRequestService = require('./collaboration/ReviewRequestService');
const CollaborationFeedService = require('./collaboration/CollaborationFeedService');

const RecordsManagementService = require('./records/RecordsManagementService');
const RetentionPolicyEngine = require('./records/RetentionPolicyEngine');
const PolicyAssignmentService = require('./records/PolicyAssignmentService');
const LegalHoldService = require('./records/LegalHoldService');
const ArchiveService = require('./records/ArchiveService');
const DispositionService = require('./records/DispositionService');
const GovernanceDashboardService = require('./records/GovernanceDashboardService');

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
  FolderService,
  CollectionService,
  TagService,
  ClassificationService,
  RecentActivityService,
  SavedSearchService,
  BulkOperationsService,
  SearchEngine,
  VaultPermissionEngine,
  SharingService,
  CommentService,
  DocumentWatchService,
  ReviewRequestService,
  CollaborationFeedService,
  RecordsManagementService,
  RetentionPolicyEngine,
  PolicyAssignmentService,
  LegalHoldService,
  ArchiveService,
  DispositionService,
  GovernanceDashboardService,
};
