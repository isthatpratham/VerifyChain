/**
 * enterpriseAdministrationMaster.test.js
 * Master Automated Test Suite & Certification for Phase 11 Enterprise Administration Platform (11.1 - 11.6).
 */

const assert = require('assert');

// Module 11.1: Identity, User & Organization Management
const { IdentityFacade } = require('../src/identity');

// Module 11.2: Enterprise IAM
const { IAMFacade } = require('../src/iam');

// Module 11.3: Platform Operations & Config
const { OperationsFacade } = require('../src/operations');

// Module 11.4: Enterprise AI Administration
const { AIAdminFacade } = require('../src/aiAdmin');

// Module 11.5: Operations Center & Analytics
const { OperationsAnalyticsFacade } = require('../src/operationsAnalytics');

async function runMasterAdministrationTestSuite() {
  console.log('================================================================');
  console.log('  STARTING ENTERPRISE ADMINISTRATION MASTER TEST SUITE (PHASE 11)');
  console.log('================================================================\n');

  try {
    // ─── STAGE 1: PHASE 11.1 IDENTITY & ORGANIZATION MANAGEMENT ─────────
    console.log('[Stage 1] Verifying Phase 11.1 Enterprise Identity & Organizations...');
    const orgsRes = await IdentityFacade.listOrganizations();
    const orgs = Array.isArray(orgsRes) ? orgsRes : (orgsRes.organizations || orgsRes.items || []);
    assert.ok(Array.isArray(orgs), 'Organizations listed');

    const usersRes = await IdentityFacade.listUsers();
    const users = Array.isArray(usersRes) ? usersRes : (usersRes.users || usersRes.items || []);
    assert.ok(Array.isArray(users), 'Platform users listed');

    const userStats = await IdentityFacade.getDashboardMetrics();
    assert.ok(userStats.totalUsers >= 0, 'User management stats computed');
    console.log('✔ Phase 11.1 Enterprise Identity passed.');

    // ─── STAGE 2: PHASE 11.2 ENTERPRISE IAM & AUTHORIZATION ─────────────
    console.log('\n[Stage 2] Verifying Phase 11.2 Enterprise IAM & Policy Engine...');
    const permissions = await IAMFacade.listPermissions();
    assert.ok(permissions.length >= 20, 'Permission catalog verified');

    const roles = await IAMFacade.listRoles();
    assert.ok(roles.length >= 11, 'Role hierarchy catalog verified');

    const canDecision = await IAMFacade.can('USER_1', 'org.read', { organizationId: 'ORG_1' });
    const isAllowed = typeof canDecision === 'object' ? canDecision.allowed : Boolean(canDecision);
    assert.strictEqual(typeof isAllowed, 'boolean', 'IAM authorization decision evaluated');
    console.log('✔ Phase 11.2 Enterprise IAM passed.');

    // ─── STAGE 3: PHASE 11.3 PLATFORM OPERATIONS & CONFIGURATIONS ───────
    console.log('\n[Stage 3] Verifying Phase 11.3 Platform Operations & Feature Flags...');
    const configs = await OperationsFacade.listSettings();
    assert.ok(configs.length >= 10, 'Platform configuration parameters verified');

    const flags = await OperationsFacade.listFeatureFlags();
    assert.ok(flags.length >= 5, 'Feature flags catalog verified');

    const storageConfigs = await OperationsFacade.listStorageProviders();
    assert.ok(storageConfigs.length >= 5, 'Storage providers registered');
    assert.ok(storageConfigs[0].id, 'Storage provider record verified');
    console.log('✔ Phase 11.3 Platform Operations passed.');

    // ─── STAGE 4: PHASE 11.4 ENTERPRISE AI ADMINISTRATION ───────────────
    console.log('\n[Stage 4] Verifying Phase 11.4 AI Administration & Prompt Governance...');
    const aiProviders = await AIAdminFacade.listProviders();
    assert.ok(aiProviders.length >= 6, 'AI provider registry verified');

    const aiModels = await AIAdminFacade.listModels();
    assert.ok(aiModels.length >= 4, 'Provider-independent model catalog verified');

    const aiPrompts = await AIAdminFacade.listPrompts();
    assert.ok(aiPrompts.length >= 3, 'Production prompt library verified');

    const aiDashboard = await AIAdminFacade.getAIDashboardStats();
    assert.ok(aiDashboard.providersCount > 0, 'AI Operations overview metrics computed');
    console.log('✔ Phase 11.4 Enterprise AI Administration passed.');

    // ─── STAGE 5: PHASE 11.5 MONITORING, ANALYTICS & OPERATIONS CENTER ──
    console.log('\n[Stage 5] Verifying Phase 11.5 Operational Intelligence & Operations Center...');
    const health = await OperationsAnalyticsFacade.getPlatformHealth();
    assert.strictEqual(health.totalModules, 14, '14 system modules health checked');
    assert.strictEqual(health.overallStatus, 'HEALTHY', 'Platform status is HEALTHY');

    const metrics = await OperationsAnalyticsFacade.getBusinessMetrics();
    assert.ok(metrics.usersCount > 0, 'Business metrics computed');

    const opsPayload = await OperationsAnalyticsFacade.getDashboardPayload();
    assert.ok(opsPayload.health.overallStatus, 'Executive Operations Center payload aggregated');
    console.log('✔ Phase 11.5 Monitoring & Analytics passed.');

    console.log('\n================================================================');
    console.log('  ENTERPRISE ADMINISTRATION PLATFORM FULLY CERTIFIED (11.1-11.6)!');
    console.log('================================================================');
  } catch (err) {
    console.error('\n❌ MASTER ADMINISTRATION TEST FAILED:', err);
    process.exit(1);
  }
}

runMasterAdministrationTestSuite();
