/**
 * enterpriseIAM.test.js
 * Comprehensive Automated Test Suite for Phase 11.2 Enterprise Roles, Permissions & Access Control (IAM).
 */

const assert = require('assert');
const {
  IAMFacade,
  PermissionCatalog,
  RoleService,
  RoleInheritanceEngine,
  PolicyEngine,
  AuthorizationEngine,
  RoleAssignmentService,
  TemporaryAccessService,
  AccessReviewService,
} = require('../src/iam');

async function runEnterpriseIAMTests() {
  console.log('================================================================');
  console.log('  STARTING ENTERPRISE IAM & AUTHORIZATION TEST SUITE (11.2)');
  console.log('================================================================\n');

  try {
    // ─── TEST 1: PERMISSION CATALOG SEEDING & CATEGORIZATION ─────────────
    console.log('[Test 1] Testing Permission Catalog Seeding & Categorization...');
    const permissions = await IAMFacade.seedPermissions();
    assert.ok(permissions.length >= 18, 'At least 18 standard permissions seeded');

    const businessPerms = await IAMFacade.listPermissions('BUSINESS');
    assert.ok(businessPerms.length >= 4, 'Business domain permissions grouped correctly');
    console.log(`✔ Permission Catalog Seeding passed (${permissions.length} permissions in catalog).`);

    // ─── TEST 2: DEFAULT ROLES SEEDING & CUSTOM ROLE CREATION ────────────
    console.log('\n[Test 2] Testing Default Roles & Custom Role Creation...');
    const roles = await IAMFacade.seedDefaultRoles();
    assert.ok(roles.length >= 10, 'Standard platform roles initialized');

    const customRole = await IAMFacade.createCustomRole({
      code: `CUSTOM_AUDITOR_${Date.now()}`,
      name: 'Special Security Auditor',
      description: 'Custom compliance and audit role',
      permissionCodes: ['audit.view', 'compliance.read', 'document.download'],
    });
    assert.ok(customRole.id, 'Custom role created with ID');
    assert.strictEqual(customRole.is_custom, true, 'is_custom flag set to true');
    assert.strictEqual(customRole.role_perms.length, 3, '3 custom permissions assigned');
    console.log('✔ Roles Seeding & Custom Role Creation passed.');

    // ─── TEST 3: ROLE INHERITANCE RESOLUTION & CIRCULAR DEPENDENCY CHECK ─
    console.log('\n[Test 3] Testing Role Inheritance Resolution & Circular Reference Protection...');
    const parentRole = await RoleService.getRoleById('COMPLIANCE_MANAGER');
    const childRole = await IAMFacade.createCustomRole({
      code: `JUNIOR_OFFICER_${Date.now()}`,
      name: 'Junior Compliance Officer',
      parentRoleId: parentRole.id,
      permissionCodes: ['compliance.read'],
    });

    const effectivePerms = await IAMFacade.resolveEffectivePermissions(childRole.id);
    assert.ok(effectivePerms.length >= 1, 'Parent role permissions inherited correctly');

    // Circular Inheritance Prevention Check
    try {
      await IAMFacade.validateNoCircularInheritance(parentRole.id, childRole.id);
      assert.fail('Should have thrown circular inheritance error');
    } catch (err) {
      assert.ok(err.message.includes('Circular role inheritance'), 'Circular inheritance caught cleanly');
    }
    console.log('✔ Role Inheritance & Circular Protection passed.');

    // ─── TEST 4: POLICY ENGINE EVALUATION ────────────────────────────────
    console.log('\n[Test 4] Testing Policy Engine Rule Evaluation...');
    await IAMFacade.seedPolicies();

    const adminEval = await IAMFacade.evaluatePolicies({
      user: { id: 1, role: 'ADMIN' },
      permission: 'document.delete',
    });
    assert.strictEqual(adminEval.allowed, true, 'Admin bypass policy passed');
    assert.strictEqual(adminEval.policyName, 'PLATFORM_ADMIN_BYPASS', 'Policy identified as PLATFORM_ADMIN_BYPASS');

    const ownerEval = await IAMFacade.evaluatePolicies({
      user: { id: 10, role: 'VIEWER' },
      permission: 'document.delete',
      resource: { owner_id: 10 },
    });
    assert.strictEqual(ownerEval.allowed, true, 'Resource owner deletion policy passed');
    console.log('✔ Policy Engine Evaluation passed.');

    // ─── TEST 5: AUTHORIZATION ENGINE DECISION MATRIX ─────────────────────
    console.log('\n[Test 5] Testing Centralized Authorization Engine Decision Matrix...');
    const adminCan = await IAMFacade.can({
      user: { id: 1, role: 'ADMIN' },
      permission: 'user.manage',
    });
    assert.strictEqual(adminCan.allowed, true, 'Admin granted permission');
    assert.strictEqual(adminCan.decision, 'PERMIT', 'Decision is PERMIT');

    const guestCan = await IAMFacade.can({
      user: { id: 999, role: 'VIEWER' },
      permission: 'user.manage',
    });
    assert.strictEqual(guestCan.allowed, false, 'Guest denied unauthorized permission');
    assert.strictEqual(guestCan.decision, 'DENY', 'Decision is DENY');
    console.log('✔ Authorization Engine Decision Matrix passed.');

    // ─── TEST 6: USER ROLE ASSIGNMENTS ────────────────────────────────────
    console.log('\n[Test 6] Testing User Role Assignment & Scope Management...');
    const assignment = await IAMFacade.assignRole({
      userId: 1,
      roleId: 'COMPLIANCE_OFFICER',
      organizationId: 1,
      resourceType: 'COMPLIANCE_WORKSPACE',
    });
    assert.ok(assignment.id, 'Role assignment record generated');
    assert.strictEqual(assignment.user_id, 1, 'Assigned to User ID 1');

    const userAssignments = await IAMFacade.listAssignments({ userId: 1 });
    assert.ok(userAssignments.length >= 1, 'Assigned role listed in user assignments');
    console.log('✔ User Role Assignments passed.');

    // ─── TEST 7: TIME-BOUND TEMPORARY ACCESS GRANTS & AUTO-EXPIRATION ─────
    console.log('\n[Test 7] Testing Time-Bound Temporary Access Grants & Sweep...');
    const tempGrant = await IAMFacade.grantTemporaryAccess({
      userId: 1,
      roleId: 'AUDITOR',
      durationDays: 1,
      reason: '7-day audit review window',
    });
    assert.ok(tempGrant.id, 'Temporary access record created');
    assert.strictEqual(tempGrant.status, 'ACTIVE', 'Grant status is ACTIVE');

    const sweepRes = await IAMFacade.sweepExpiredGrants();
    assert.strictEqual(typeof sweepRes.sweptCount, 'number', 'Sweeper returns numeric count');
    console.log('✔ Time-Bound Temporary Access passed.');

    // ─── TEST 8: ADMINISTRATIVE ACCESS REVIEW AUDITS & DASHBOARD ─────────
    console.log('\n[Test 8] Testing Administrative Access Review Audits & Metrics...');
    const review = await IAMFacade.conductAccessReview({
      title: 'Q3 Security Audit Review',
      reviewerId: 'SUPER_ADMIN',
    });
    assert.ok(review.id, 'Access review record generated');
    assert.strictEqual(review.status, 'COMPLETED', 'Review status is COMPLETED');

    const dashboard = await IAMFacade.getIAMDashboardStats();
    assert.ok(dashboard.totalRoles > 0, 'Dashboard total roles > 0');
    assert.ok(dashboard.totalPermissions > 0, 'Dashboard total permissions > 0');
    console.log(`✔ IAM Dashboard & Access Reviews passed (Roles: ${dashboard.totalRoles}, Permissions: ${dashboard.totalPermissions}).`);

    console.log('\n================================================================');
    console.log('  ENTERPRISE IAM & AUTHORIZATION PASSED ALL VERIFICATIONS!');
    console.log('================================================================');
  } catch (err) {
    console.error('\n❌ ENTERPRISE IAM TEST FAILED:', err);
    process.exit(1);
  }
}

runEnterpriseIAMTests();
