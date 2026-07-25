/**
 * documentVersioning.test.js
 * Automated Test Suite for Phase 10.2 Enterprise Version Control & Metadata Intelligence.
 */

const assert = require('assert');
const { DocumentVault, VersionManager, MetadataEvolutionEngine, VersionComparisonEngine, VersionTimelineService, RollbackManager, DocumentLineageService } = require('../src/documentVault');
const StorageProviderFactory = require('../src/documentVault/storage/StorageProviderFactory');

async function runDocumentVersioningTests() {
  console.log('=== STARTING ENTERPRISE DOCUMENT VERSIONING TEST SUITE (PHASE 10.2) ===\n');

  try {
    const adminUser = { id: 1, role: 'ADMIN', msmeId: 1 };
    const provider = StorageProviderFactory.getProvider('LOCAL');

    // 1. Ingest initial document asset (should automatically create initial version v1.0)
    console.log('[Test 1] Testing Ingestion & Initial Version v1.0 Registration...');
    const testBuffer = Buffer.from('VerifyChain Version Control Base Binary v1.0');
    const asset = await DocumentVault.ingestAsset({
      fileBuffer: testBuffer,
      fileName: 'tax_compliance_filing_2026.pdf',
      mimeType: 'application/pdf',
      title: 'Tax Compliance Filing 2026',
      documentType: 'TAX_FILING',
      category: 'COMPLIANCE',
      msmeId: 1,
      user: adminUser,
      metadata: { businessMetadata: { gstin: '27AAAAA0000A1Z5', taxYear: 2026 } },
    });

    assert.strictEqual(asset.currentVersion, 'v1.0', 'Initial asset current_version must be v1.0');

    const initialHistory = await VersionManager.getVersionHistory(asset.assetId);
    assert.strictEqual(initialHistory.length, 1, 'Initial version history count must be 1');
    assert.strictEqual(initialHistory[0].version_number, 'v1.0', 'Initial version number must be v1.0');
    console.log('✔ Initial Version v1.0 registered successfully.');

    // 2. Minor Version Increment (v1.0 -> v1.1)
    console.log('\n[Test 2] Testing Minor Version Increment (v1.0 -> v1.1)...');
    const v1_1 = await VersionManager.createVersion({
      assetId: asset.assetId,
      incrementType: 'MINOR',
      changeSummary: 'Updated tax compliance metadata and added GST verification code',
      changedBy: 'USER_1',
      versionTag: 'VERIFIED',
      updatedMetadata: {
        businessMetadata: { gstin: '27AAAAA0000A1Z5', taxYear: 2026, status: 'VERIFIED' },
        aiMetadata: { confidenceScore: 0.98, classifiedType: 'GST_RETURNS' },
      },
      fieldChanges: [
        { fieldName: 'businessMetadata.status', previousValue: 'PENDING', newValue: 'VERIFIED', changeType: 'METADATA_UPDATE' },
        { fieldName: 'aiMetadata.classifiedType', previousValue: null, newValue: 'GST_RETURNS', changeType: 'AI_REANALYSIS' },
      ],
    });

    assert.strictEqual(v1_1.version_number, 'v1.1', 'Minor version increment must yield v1.1');
    assert.strictEqual(v1_1.major_version, 1, 'Major version must remain 1');
    assert.strictEqual(v1_1.minor_version, 1, 'Minor version must be 1');
    console.log('✔ Minor Version v1.1 created.');

    // 3. Major Version Increment (v1.1 -> v2.0)
    console.log('\n[Test 3] Testing Major Version Increment (v1.1 -> v2.0)...');
    const v2_0 = await VersionManager.createVersion({
      assetId: asset.assetId,
      incrementType: 'MAJOR',
      changeSummary: 'Major annual audit re-filing and file replacement',
      changedBy: 'USER_1',
      versionTag: 'COMPLIANCE_APPROVED',
      updatedMetadata: {
        businessMetadata: { gstin: '27AAAAA0000A1Z5', taxYear: 2026, status: 'AUDITED' },
        complianceMetadata: { approvedBy: 'CISO Office', approvalTimestamp: new Date().toISOString() },
      },
    });

    assert.strictEqual(v2_0.version_number, 'v2.0', 'Major version increment must yield v2.0');
    assert.strictEqual(v2_0.major_version, 2, 'Major version must be 2');
    assert.strictEqual(v2_0.minor_version, 0, 'Minor version must reset to 0');
    console.log('✔ Major Version v2.0 created.');

    // 4. Metadata Evolution Engine & Field Deltas Test
    console.log('\n[Test 4] Testing Metadata Evolution Engine Deltas...');
    const deltas = MetadataEvolutionEngine.computeMetadataDeltas(v1_1.metadata_snapshot, v2_0.metadata_snapshot);
    assert.ok(deltas.length > 0, 'Metadata deltas must be detected between v1.1 and v2.0');
    console.log(`✔ Metadata Evolution Engine computed ${deltas.length} field delta(s).`);

    // 5. Side-by-side Version Comparison Engine Test
    console.log('\n[Test 5] Testing Version Comparison Engine (v1.0 vs v2.0)...');
    const compRes = await VersionComparisonEngine.compareVersions(asset.assetId, 'v1.0', 'v2.0');
    assert.strictEqual(compRes.versionA.versionNumber, 'v1.0', 'Version A matches v1.0');
    assert.strictEqual(compRes.versionB.versionNumber, 'v2.0', 'Version B matches v2.0');
    assert.ok(compRes.humanReadableSummary, 'Human readable summary generated');
    console.log(`✔ Version Comparison Engine generated report: "${compRes.humanReadableSummary}"`);

    // 6. Version Timeline Service Test
    console.log('\n[Test 6] Testing Unified Version Timeline Service...');
    const timeline = await VersionTimelineService.getAssetTimeline(asset.assetId);
    assert.strictEqual(timeline.totalVersionsCount, 3, 'Total versions in timeline must be 3 (v1.0, v1.1, v2.0)');
    assert.ok(timeline.events.length >= 3, 'Timeline events count >= 3');
    console.log(`✔ Version Timeline Service retrieved ${timeline.events.length} timeline events.`);

    // 7. Soft Rollback Manager Test
    console.log('\n[Test 7] Testing Soft Rollback Manager (Rollback to v1.0)...');
    const rollbackRes = await RollbackManager.rollbackToVersion(asset.assetId, 'v1.0', adminUser, 'Testing rollback to initial filing');
    assert.strictEqual(rollbackRes.targetVersionNumber, 'v1.0', 'Target rollback version is v1.0');
    assert.strictEqual(rollbackRes.newVersionNumber, 'v2.1', 'Soft rollback creates new minor version v2.1 without destroying history');

    const updatedHistory = await VersionManager.getVersionHistory(asset.assetId);
    assert.strictEqual(updatedHistory.length, 4, 'Total history version count must now be 4');
    assert.strictEqual(updatedHistory[0].version_number, 'v2.1', 'Current latest version is v2.1');
    console.log('✔ Soft Rollback Manager successfully created restored version v2.1 without mutating historical records.');

    // 8. Document Lineage Service Test
    console.log('\n[Test 8] Testing Document Lineage Ancestry Graph...');
    const lineageGraph = await DocumentLineageService.getDocumentLineage(asset.assetId);
    assert.ok(lineageGraph.totalNodesCount >= 4, 'Lineage graph contains all historical version nodes');
    console.log(`✔ Document Lineage Graph retrieved ${lineageGraph.totalNodesCount} ancestry nodes.`);

    console.log('\n=== ENTERPRISE DOCUMENT VERSIONING PASSED ALL VERIFICATIONS (PHASE 10.2) ===');
  } catch (err) {
    console.error('\n❌ ENTERPRISE DOCUMENT VERSIONING TEST FAILED:', err);
    process.exit(1);
  }
}

runDocumentVersioningTests();
