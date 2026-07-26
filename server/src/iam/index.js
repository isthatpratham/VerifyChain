/**
 * index.js
 * Central Exporter for Enterprise Identity & Access Management (Phase 11.2).
 */

const IAMFacade = require('./IAMFacade');
const { PermissionCatalog } = require('./PermissionCatalog');
const RoleService = require('./RoleService');
const RoleInheritanceEngine = require('./RoleInheritanceEngine');
const PolicyEngine = require('./PolicyEngine');
const AuthorizationEngine = require('./AuthorizationEngine');
const RoleAssignmentService = require('./RoleAssignmentService');
const TemporaryAccessService = require('./TemporaryAccessService');
const AccessReviewService = require('./AccessReviewService');

module.exports = {
  IAMFacade,
  PermissionCatalog,
  RoleService,
  RoleInheritanceEngine,
  PolicyEngine,
  AuthorizationEngine,
  RoleAssignmentService,
  TemporaryAccessService,
  AccessReviewService,
};
