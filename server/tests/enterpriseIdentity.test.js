/**
 * enterpriseIdentity.test.js
 * Comprehensive Automated Test Suite for Phase 11.1 Enterprise Identity, User & Organization Management.
 */

const assert = require('assert');
const {
  IdentityFacade,
  IdentityService,
  OrganizationService,
  OrganizationMembershipService,
  InvitationService,
  UserLifecycleService,
  OrganizationLifecycleService,
  ProfileAdministrationService,
  OrganizationAdministrationService,
  IdentitySearchService,
} = require('../src/identity');

async function runEnterpriseIdentityTests() {
  console.log('================================================================');
  console.log('  STARTING ENTERPRISE IDENTITY & ADMINISTRATION TEST SUITE (11.1)');
  console.log('================================================================\n');

  try {
    // ─── TEST 1: USER IDENTITY CREATION & PROFILE PROVISIONING ───────────
    console.log('[Test 1] Testing User Identity Provisioning & Profile Initialization...');
    const testEmail = `admin_test_${Date.now()}@verifychain.io`;
    const user = await IdentityService.createUser({
      email: testEmail,
      name: 'Global Platform Administrator',
      jobTitle: 'Chief Security Officer',
      department: 'Security & Compliance',
      role: 'ADMIN',
    });
    assert.ok(user.id, 'User ID generated');
    assert.strictEqual(user.email, testEmail.toLowerCase(), 'Email normalized and stored');
    assert.ok(user.profile, 'User profile initialized');
    assert.strictEqual(user.profile.job_title, 'Chief Security Officer', 'Profile job title matches');
    console.log('✔ User Identity Provisioning passed.');

    // ─── TEST 2: ORGANIZATION CREATION & SETTINGS ───────────────────────
    console.log('\n[Test 2] Testing Organization Creation & Defaults Seeding...');
    const orgName = `VerifyChain Global Corp ${Date.now()}`;
    const org = await OrganizationService.createOrganization({
      name: orgName,
      legalName: `${orgName} Private Limited`,
      subscriptionTier: 'ENTERPRISE',
      storageQuotaMb: 50000,
      primaryContactEmail: testEmail,
    });
    assert.ok(org.id, 'Organization ID generated');
    assert.ok(org.settings, 'Organization settings seeded');
    assert.strictEqual(org.subscription_tier, 'ENTERPRISE', 'Subscription tier set to ENTERPRISE');
    console.log('✔ Organization Creation & Defaults passed.');

    // ─── TEST 3: MEMBERSHIP MANAGEMENT & ROLE ASSIGNMENT ─────────────────
    console.log('\n[Test 3] Testing Organization Membership & Primary Switching...');
    const membership = await OrganizationMembershipService.addMember({
      organizationId: org.id,
      userId: user.id,
      role: 'OWNER',
      isPrimary: true,
    });
    assert.ok(membership.id, 'Membership record created');
    assert.strictEqual(membership.role, 'OWNER', 'Role assigned as OWNER');

    const members = await OrganizationMembershipService.listMembers(org.id);
    assert.strictEqual(members.length, 1, '1 active organization member returned');
    console.log('✔ Membership Management & Role Assignment passed.');

    // ─── TEST 4: ENTERPRISE INVITATION WORKFLOW ──────────────────────────
    console.log('\n[Test 4] Testing Enterprise Invitation Workflow & Token Acceptance...');
    const inviteeEmail = `invitee_${Date.now()}@supplier.org`;
    const invitation = await InvitationService.createInvitation({
      email: inviteeEmail,
      organizationId: org.id,
      role: 'COMPLIANCE_OFFICER',
      notes: 'Welcome to VerifyChain enterprise compliance platform',
    });
    assert.ok(invitation.token, 'Invitation token generated');
    assert.strictEqual(invitation.status, 'PENDING', 'Invitation status is PENDING');

    // Create target user for invitation acceptance
    const targetUser = await IdentityService.createUser({
      email: inviteeEmail,
      name: 'Invited Compliance Auditor',
      role: 'MSME_OWNER',
    });

    const acceptRes = await InvitationService.acceptInvitation({
      token: invitation.token,
      userId: targetUser.id,
    });
    assert.strictEqual(acceptRes.accepted, true, 'Invitation accepted successfully');
    assert.strictEqual(acceptRes.membership.role, 'COMPLIANCE_OFFICER', 'Invited role provisioned in membership');
    console.log('✔ Enterprise Invitation Workflow passed.');

    // ─── TEST 5: USER LIFECYCLE & ACCOUNT SUSPENSION ──────────────────────
    console.log('\n[Test 5] Testing User Lifecycle Transitions & Status History...');
    const suspendRes = await UserLifecycleService.suspendUser(targetUser.id, 'Compliance policy violation investigation');
    assert.strictEqual(suspendRes.toStatus, 'SUSPENDED', 'User status transitioned to SUSPENDED');
    assert.strictEqual(suspendRes.isActive, false, 'is_active set to false');

    const restoreRes = await UserLifecycleService.restoreUser(targetUser.id, 'Investigation cleared cleanly');
    assert.strictEqual(restoreRes.toStatus, 'ACTIVE', 'User status restored to ACTIVE');
    assert.strictEqual(restoreRes.isActive, true, 'is_active restored to true');
    console.log('✔ User Lifecycle Transitions passed.');

    // ─── TEST 6: ORGANIZATION LIFECYCLE STATE MACHINE ────────────────────
    console.log('\n[Test 6] Testing Organization Lifecycle Transitions...');
    const orgSuspend = await OrganizationLifecycleService.suspendOrganization(org.id, 'Routine annual audit freeze');
    assert.strictEqual(orgSuspend.toStatus, 'SUSPENDED', 'Organization suspended');

    const orgActivate = await OrganizationLifecycleService.activateOrganization(org.id, 'Annual audit verified');
    assert.strictEqual(orgActivate.toStatus, 'ACTIVE', 'Organization reactivated');
    console.log('✔ Organization Lifecycle State Machine passed.');

    // ─── TEST 7: PROFILE & ORGANIZATION ADMINISTRATION ───────────────────
    console.log('\n[Test 7] Testing Profile & Organization Administrative Updates...');
    const updatedProfile = await ProfileAdministrationService.updateProfile(user.id, {
      jobTitle: 'Senior Vice President of Governance',
      department: 'Executive Leadership',
      timezone: 'America/New_York',
    });
    assert.strictEqual(updatedProfile.job_title, 'Senior Vice President of Governance', 'Job title updated');

    const updatedOrg = await OrganizationAdministrationService.updateOrganization(org.id, {
      storageQuotaMb: 100000,
      settings: {
        securityDefaults: { mfaRequired: true, sessionTimeoutMins: 30 },
      },
    });
    assert.strictEqual(updatedOrg.storage_quota_mb, 100000, 'Storage quota expanded to 100,000 MB');
    console.log('✔ Profile & Organization Administration passed.');

    // ─── TEST 8: UNIVERSAL ADMINISTRATION SEARCH & DASHBOARD ──────────────
    console.log('\n[Test 8] Testing Administration Search & Dashboard Statistics...');
    const searchRes = await IdentitySearchService.search({ query: 'Global', category: 'ALL' });
    assert.ok(searchRes.users.length > 0 || searchRes.organizations.length > 0, 'Administration search returned results');

    const metrics = await IdentityFacade.getDashboardMetrics();
    assert.ok(metrics.totalUsers > 0, 'Dashboard total users > 0');
    assert.ok(metrics.totalOrganizations > 0, 'Dashboard total organizations > 0');
    console.log(`✔ Administration Dashboard Metrics passed (Users: ${metrics.totalUsers}, Orgs: ${metrics.totalOrganizations}).`);

    console.log('\n================================================================');
    console.log('  ENTERPRISE IDENTITY & ADMINISTRATION PASSED ALL VERIFICATIONS!');
    console.log('================================================================');
  } catch (err) {
    console.error('\n❌ IDENTITY TEST FAILED:', err);
    process.exit(1);
  }
}

runEnterpriseIdentityTests();
