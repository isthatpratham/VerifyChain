/**
 * documentVaultMasterAudit.test.js
 * Master Production Hardening & Complete Audit Test Suite for Phase 10 Enterprise Document Vault.
 */

const assert = require('assert');
const {
  DocumentVault,
  VaultPermissionEngine,
  SharingService,
  CommentService,
  DocumentWatchService,
  ReviewRequestService,
  CollaborationFeedService,
  RetentionPolicyEngine,
  PolicyAssignmentService,
  LegalHoldService,
  ArchiveService,
  DispositionService,
  GovernanceDashboardService,
  RecordsManagementService,
  FolderService,
  CollectionService,
  TagService,
  ClassificationService,
  SearchEngine,
  BulkOperationsService,
} = require('../src/documentVault');

async function runMasterAuditTestSuite() {
  console.log('================================================================');
  console.log('  STARTING ENTERPRISE DOCUMENT VAULT MASTER AUDIT (PHASE 10.6)');
  console.log('================================================================\n');

  try {
    const adminUser = { id: 1, role: 'ADMIN', msmeId: 1 };
    const reviewerUser = { id: 102, role: 'REVIEWER', msmeId: 1 };
    const viewerUser = { id: 205, role: 'VIEWER', msmeId: 1 };

    // ─── STAGE 1: REPOSITORY FOUNDATION & STORAGE ABSTRACTION ─────────────
    console.log('[Stage 1] Auditing Repository Foundation & Storage Abstraction...');
    const asset = await DocumentVault.ingestAsset({
      fileBuffer: Buffer.from('Master Audit Document Content Payload 2026'),
      fileName: 'master_audit_payload.pdf',
      mimeType: 'application/pdf',
      title: 'Master Audit Document 2026',
      documentType: 'AUDIT_REPORT',
      category: 'COMPLIANCE',
      msmeId: 1,
      user: adminUser,
    });
    assert.ok(asset.assetId, 'Asset ID generated');
    assert.ok(asset.checksum, 'SHA-256 Checksum generated');

    const fetchedAsset = await DocumentVault.getAssetById(asset.assetId, adminUser);
    assert.strictEqual(fetchedAsset.title, 'Master Audit Document 2026', 'Fetched asset title matches');
    console.log('  ✔ Repository Foundation audit passed.');

    // ─── STAGE 2: IMMUTABLE VERSION CONTROL & LINEAGE ────────────────────
    console.log('\n[Stage 2] Auditing Immutable Version Control & Lineage...');
    const v2 = await DocumentVault.createVersion({
      assetId: asset.assetId,
      incrementType: 'MINOR',
      changeSummary: 'Added compliance annexure',
      changedBy: 'USER_1',
      updatedMetadata: { annexure: 'A1' },
    });
    assert.strictEqual(v2.version_number || v2.versionNumber, 'v1.1', 'Version incremented to v1.1');

    const versions = await DocumentVault.listVersions(asset.assetId);
    assert.strictEqual(versions.length, 2, '2 immutable version snapshots found');

    const comparison = await DocumentVault.compareVersions(asset.assetId, 'v1.0', 'v1.1');
    assert.ok(comparison.fieldDeltas || comparison.metadataDiff, 'Metadata evolution diff computed');
    console.log('  ✔ Version Control & Lineage audit passed.');

    // ─── STAGE 3: SMART ORGANIZATION & ENTERPRISE SEARCH ─────────────────
    console.log('\n[Stage 3] Auditing Smart Organization & Enterprise Search...');
    const folder = await FolderService.createFolder({
      name: 'Master Governance Folder',
      msmeId: 1,
    });
    assert.ok(folder.folder_id, 'Folder created');

    await TagService.tagAssets({ assetIds: [asset.assetId], tags: ['AUDITED', 'PRODUCTION_READY'], msmeId: 1 });
    const searchRes = await SearchEngine.search({ query: 'Master Audit', msmeId: 1 });
    assert.ok(searchRes.results.length > 0, 'Advanced Search returned matching asset');
    console.log('  ✔ Smart Organization & Enterprise Search audit passed.');

    // ─── STAGE 4: SHARING, PERMISSIONS & COLLABORATION ───────────────────
    console.log('\n[Stage 4] Auditing Sharing, Permissions & Collaboration...');
    const accessEval = await VaultPermissionEngine.evaluateAccess({
      user: viewerUser,
      assetId: asset.assetId,
      requestedAction: 'delete',
      msmeId: 1,
    });
    assert.strictEqual(accessEval.allowed, false, 'Least privilege RBAC blocked VIEWER from deleting asset');

    const comment = await CommentService.addComment({
      assetId: asset.assetId,
      userId: 102,
      userName: 'Reviewer Jane',
      content: 'Please verify section 3 @Role_Admin',
      msmeId: 1,
    });
    assert.strictEqual(comment.parsedMentions.length, 1, '@Role_Admin mention parsed');
    console.log('  ✔ Sharing, Permissions & Collaboration audit passed.');

    // ─── STAGE 5: RECORDS MANAGEMENT, RETENTION & LEGAL HOLD ──────────────
    console.log('\n[Stage 5] Auditing Records Management, Retention & Legal Hold...');
    const policies = await RetentionPolicyEngine.listPolicies(1);
    assert.ok(policies.length >= 6, 'Standard statutory policies present');

    const hold = await LegalHoldService.createLegalHold({
      title: 'Auditor General Inquiry 2026',
      caseReference: 'CASE_AUDIT_2026',
      reason: 'Statutory compliance verification',
      assetIds: [asset.assetId],
      msmeId: 1,
    });
    assert.ok(hold.hold_id, 'Legal hold created');

    const holdCheck = await LegalHoldService.canDeleteOrDispose(asset.assetId, 1);
    assert.strictEqual(holdCheck.allowed, false, 'Legal hold blocked deletion/disposition');

    await LegalHoldService.releaseLegalHold({ holdId: hold.hold_id, msmeId: 1 });
    const holdCheckAfter = await LegalHoldService.canDeleteOrDispose(asset.assetId, 1);
    assert.strictEqual(holdCheckAfter.allowed, true, 'Deletion allowed after legal hold release');
    console.log('  ✔ Records Management, Retention & Legal Hold audit passed.');

    // ─── STAGE 6: SECURITY & CROSS-TENANT ISOLATION ─────────────────────
    console.log('\n[Stage 6] Auditing Security & Cross-Tenant Boundary Hardening...');
    const crossTenantEval = await VaultPermissionEngine.evaluateAccess({
      user: { id: 999, role: 'ADMIN', msmeId: 99 }, // Different MSME Workspace
      assetId: asset.assetId,
      requestedAction: 'view',
      msmeId: 1,
    });
    assert.strictEqual(crossTenantEval.allowed, false, 'Cross-tenant boundary isolation enforced');
    console.log('  ✔ Security & Cross-Tenant Boundary Hardening audit passed.');

    // ─── STAGE 7: PERFORMANCE & LATENCY AUDIT ────────────────────────────
    console.log('\n[Stage 7] Auditing Performance & Query Latency...');
    const startTime = Date.now();
    const govMetrics = await GovernanceDashboardService.getGovernanceMetrics(1);
    const duration = Date.now() - startTime;
    assert.ok(duration < 500, `Governance Dashboard query latency (${duration}ms) is sub-second (<500ms)`);
    assert.ok(govMetrics.totalAssets > 0, 'Metrics calculated correctly');
    console.log(`  ✔ Performance audit passed (${duration}ms query latency).`);

    console.log('\n================================================================');
    console.log('  ENTERPRISE DOCUMENT VAULT PASSED 100% PRODUCTION HARDENING AUDIT!');
    console.log('================================================================');
  } catch (err) {
    console.error('\n❌ MASTER AUDIT TEST FAILED:', err);
    process.exit(1);
  }
}

runMasterAuditTestSuite();
