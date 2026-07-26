/**
 * documentRecords.test.js
 * Automated Test Suite for Phase 10.5 Enterprise Records Management, Retention & Legal Hold.
 */

const assert = require('assert');
const {
  DocumentVault,
  RetentionPolicyEngine,
  PolicyAssignmentService,
  LegalHoldService,
  ArchiveService,
  DispositionService,
  GovernanceDashboardService,
  RecordsManagementService,
} = require('../src/documentVault');

async function runRecordsManagementTests() {
  console.log('=== STARTING ENTERPRISE RECORDS MANAGEMENT & LEGAL HOLD TEST SUITE (PHASE 10.5) ===\n');

  try {
    const adminUser = { id: 1, role: 'ADMIN', msmeId: 1 };

    // 1. Policy Seeding & Creation Test
    console.log('[Test 1] Testing Retention Policy Engine & Seeding Default Policies...');
    const seededPolicies = await RetentionPolicyEngine.listPolicies(1);
    assert.ok(seededPolicies.length >= 6, 'At least 6 default retention policies seeded (GST, KYC, Financial, Legal, Supplier, System Logs)');

    const customPolicy = await RetentionPolicyEngine.createPolicy({
      name: 'Custom SLA Retention Policy',
      code: 'POL_CUSTOM_SLA_3Y',
      retentionDays: 1095,
      archiveAction: 'AUTO_ARCHIVE',
      dispositionAction: 'REVIEW_REQUIRED',
      msmeId: 1,
    });
    assert.ok(customPolicy.policy_id, 'Custom policy created');
    console.log('✔ Retention Policy Engine & Default Seeding passed.');

    // 2. Ingest Asset & Policy Assignment Test
    console.log('\n[Test 2] Testing Policy Assignment & Expiration Calculation...');
    const asset = await DocumentVault.ingestAsset({
      fileBuffer: Buffer.from('GST Annual Return 2026 Audit Filing'),
      fileName: 'gst_annual_2026.pdf',
      mimeType: 'application/pdf',
      title: 'GST Annual Return 2026',
      documentType: 'GST_RETURN',
      category: 'COMPLIANCE',
      msmeId: 1,
      user: adminUser,
    });

    const gstPolicy = seededPolicies.find(p => p.code === 'POL_GST_8Y');
    assert.ok(gstPolicy, 'GST 8Y policy exists');

    const assignment = await PolicyAssignmentService.assignPolicy({
      assetId: asset.assetId,
      policyId: gstPolicy.policy_id,
      assignedBy: 'ADMIN_USER',
      msmeId: 1,
    });
    assert.ok(assignment.id, 'Policy assignment recorded');

    const updatedAsset = await DocumentVault.getAssetById(asset.assetId, adminUser);
    assert.ok(updatedAsset.retention_expires_at || updatedAsset.retentionExpiresAt, 'Retention expiration date calculated');
    const lState = updatedAsset.lifecycle_state || updatedAsset.lifecycleState;
    assert.ok(lState === 'RETENTION_ACTIVE' || lState === 'ACTIVE', 'Lifecycle state updated to RETENTION_ACTIVE');
    console.log('✔ Policy Assignment & Expiration Calculation passed.');

    // 3. Legal Hold & Hold Protection Enforcement Test
    console.log('\n[Test 3] Testing Legal Hold Creation & Protection Enforcement...');
    const legalHold = await LegalHoldService.createLegalHold({
      title: 'Tax Audit Investigation 2026',
      caseReference: 'CASE_TAX_2026_099',
      reason: 'Statutory audit inquiry by Revenue Authority',
      priority: 'URGENT',
      assetIds: [asset.assetId],
      assignedBy: 'CHIEF_COMPLIANCE_OFFICER',
      msmeId: 1,
    });
    assert.ok(legalHold.hold_id, 'Legal hold created');

    const holdCheck = await LegalHoldService.canDeleteOrDispose(asset.assetId, 1);
    assert.strictEqual(holdCheck.allowed, false, 'Deletion/Disposition blocked due to active Legal Hold');

    // Attempting archive or disposition while under legal hold should fail
    await assert.rejects(
      async () => {
        await ArchiveService.archiveAsset({ assetId: asset.assetId, msmeId: 1 });
      },
      /under active Legal Hold/,
      'Archiving blocked while under legal hold'
    );
    console.log('✔ Legal Hold & Protection Enforcement passed.');

    // 4. Release Legal Hold Test
    console.log('\n[Test 4] Testing Legal Hold Release...');
    await LegalHoldService.releaseLegalHold({
      holdId: legalHold.hold_id,
      releasedBy: 'CHIEF_COMPLIANCE_OFFICER',
      notes: 'Audit inquiry concluded with zero findings',
      msmeId: 1,
    });

    const holdCheckAfterRelease = await LegalHoldService.canDeleteOrDispose(asset.assetId, 1);
    assert.strictEqual(holdCheckAfterRelease.allowed, true, 'Deletion/Disposition allowed after Legal Hold release');
    console.log('✔ Legal Hold Release passed.');

    // 5. Enterprise Archiving & Restore Test
    console.log('\n[Test 5] Testing Enterprise Archiving & Restore...');
    const archiveRec = await ArchiveService.archiveAsset({
      assetId: asset.assetId,
      archiveType: 'MANUAL',
      storageTier: 'COLD_ARCHIVE',
      archivedBy: 'ADMIN_USER',
      msmeId: 1,
    });
    assert.ok(archiveRec.archive_id, 'Archive record created');

    const archivedList = await ArchiveService.listArchivedAssets(1);
    assert.ok(archivedList.length >= 1, 'Asset found in Archived List');

    await ArchiveService.restoreAsset({ assetId: asset.assetId, restoredBy: 'ADMIN_USER', msmeId: 1 });
    const assetAfterRestore = await DocumentVault.getAssetById(asset.assetId, adminUser);
    assert.strictEqual(assetAfterRestore.archived_flag ?? assetAfterRestore.archivedFlag, false, 'Asset restored from archive');
    console.log('✔ Enterprise Archiving & Restore passed.');

    // 6. Governed Disposition Workflow Test
    console.log('\n[Test 6] Testing Governed Disposition Review & Secure Execution...');
    const dispRecord = await DispositionService.queueForDisposition({
      assetId: asset.assetId,
      dispositionType: 'SECURE_DESTROY',
      msmeId: 1,
    });
    assert.strictEqual(dispRecord.status, 'PENDING_REVIEW', 'Disposition queued for review');

    const reviewRes = await DispositionService.reviewDisposition({
      dispositionId: dispRecord.disposition_id,
      approved: true,
      reviewerId: 'COMPLIANCE_OFFICER_1',
      notes: 'Approved for destruction after retention expiration',
      msmeId: 1,
    });
    assert.strictEqual(reviewRes.status, 'APPROVED', 'Disposition approved by officer');

    const execRes = await DispositionService.executeDisposition({
      dispositionId: dispRecord.disposition_id,
      executorId: 'SYSTEM_DISPOSITION_WORKER',
      msmeId: 1,
    });
    assert.strictEqual(execRes.status, 'EXECUTED', 'Disposition executed cleanly');

    const disposedAsset = await DocumentVault.getAssetById(asset.assetId, adminUser);
    assert.strictEqual(disposedAsset.deleted_flag ?? disposedAsset.deletedFlag, true, 'Asset marked deleted/disposed');
    assert.strictEqual(disposedAsset.lifecycle_state ?? disposedAsset.lifecycleState, 'DESTROYED', 'Lifecycle state updated to DESTROYED');
    console.log('✔ Governed Disposition Review & Execution passed.');

    // 7. Lifecycle State Machine Transitions Test
    console.log('\n[Test 7] Testing Document Lifecycle State Machine...');
    const asset2 = await DocumentVault.ingestAsset({
      fileBuffer: Buffer.from('Draft Procurement Terms'),
      fileName: 'terms_draft.pdf',
      mimeType: 'application/pdf',
      title: 'Draft Terms 2026',
      documentType: 'AGREEMENT',
      category: 'LEGAL',
      msmeId: 1,
      user: adminUser,
    });

    await RecordsManagementService.transitionLifecycle({ assetId: asset2.assetId, targetState: 'APPROVED', msmeId: 1 });
    const asset2Approved = await DocumentVault.getAssetById(asset2.assetId, adminUser);
    assert.strictEqual(asset2Approved.lifecycle_state ?? asset2Approved.lifecycleState, 'APPROVED', 'Lifecycle transitioned to APPROVED');
    console.log('✔ Document Lifecycle State Machine passed.');

    // 8. Governance Dashboard & Reports Test
    console.log('\n[Test 8] Testing Governance Dashboard Metrics & Reports...');
    const metrics = await GovernanceDashboardService.getGovernanceMetrics(1);
    assert.ok(metrics.totalAssets > 0, 'Total assets counted');
    assert.ok(metrics.activePolicies >= 6, 'Active policies counted');

    const report = await GovernanceDashboardService.generateReport({
      title: 'Q1 Governance Compliance Overview',
      reportType: 'GOVERNANCE_HEALTH',
      msmeId: 1,
    });
    assert.ok(report.report_id, 'Governance report generated');
    console.log('✔ Governance Dashboard Metrics & Reports passed.');

    console.log('\n=== ENTERPRISE RECORDS MANAGEMENT PASSED ALL VERIFICATIONS (PHASE 10.5) ===');
  } catch (err) {
    console.error('\n❌ RECORDS MANAGEMENT TEST FAILED:', err);
    process.exit(1);
  }
}

runRecordsManagementTests();
