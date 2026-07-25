/**
 * documentVault.test.js
 * Automated Test Suite for Phase 10.1 Enterprise Document Repository Foundation (Document Vault).
 */

const assert = require('assert');
const { DocumentVault, StorageProviderFactory, VaultAsset, VAULT_STATUSES, VAULT_CATEGORIES } = require('../src/documentVault');
const VaultRepository = require('../src/documentVault/infrastructure/VaultRepository');
const VaultMetadataService = require('../src/documentVault/metadata/VaultMetadataService');
const VaultPermissionService = require('../src/documentVault/permission/VaultPermissionService');

async function runDocumentVaultTests() {
  console.log('=== STARTING ENTERPRISE DOCUMENT VAULT TEST SUITE (PHASE 10.1) ===\n');

  try {
    // 1. Storage Provider Abstraction Test
    console.log('[Test 1] Testing Storage Provider Abstraction & Local Provider...');
    const provider = StorageProviderFactory.getProvider('LOCAL');
    assert.strictEqual(provider.providerCode, 'LOCAL', 'Provider code must be LOCAL');

    const testBuffer = Buffer.from('VerifyChain Enterprise Vault Spec Test File Binary Payload');
    const storeRes = await provider.store({
      fileBuffer: testBuffer,
      fileName: 'spec_test_file.pdf',
      mimeType: 'application/pdf',
    });

    assert.ok(storeRes.storageIdentifier, 'Storage identifier must be generated');
    assert.ok(storeRes.checksum, 'SHA-256 checksum must be generated');

    const retrieveRes = await provider.retrieve(storeRes.storageIdentifier);
    assert.strictEqual(retrieveRes.buffer.toString(), testBuffer.toString(), 'Retrieved buffer must match original');

    const isValidIntegrity = await provider.verifyIntegrity(storeRes.storageIdentifier, storeRes.checksum);
    assert.strictEqual(isValidIntegrity, true, 'Integrity verification must pass');

    const health = await provider.healthCheck();
    assert.strictEqual(health.status, 'HEALTHY', 'Storage provider health must be HEALTHY');
    console.log('✔ Storage Provider Abstraction passed.');

    // 2. Metadata & Permission Layer Tests
    console.log('\n[Test 2] Testing Metadata & Permission Systems...');
    const metadata = VaultMetadataService.buildMetadata({
      fileMetadata: { extension: 'pdf', pagesCount: 3 },
      businessMetadata: { gstin: '27AAAAA0000A1Z5' },
      complianceMetadata: { authority: 'GST' },
    });
    assert.ok(metadata.file_metadata, 'file_metadata structured');
    assert.strictEqual(metadata.business_metadata.gstin, '27AAAAA0000A1Z5', 'GSTIN mapped');

    const adminUser = { id: 1, role: 'ADMIN', msmeId: 1 };
    const permRes = VaultPermissionService.validateAccess({ user: adminUser, requestedAction: 'UPLOAD' });
    assert.strictEqual(permRes.allowed, true, 'Admin upload permission allowed');
    console.log('✔ Metadata & Permission Systems passed.');

    // 3. Vault Ingestion & Repository Storage Test
    console.log('\n[Test 3] Testing Vault Asset Ingestion & Database Repository...');
    const asset = await DocumentVault.ingestAsset({
      fileBuffer: testBuffer,
      fileName: 'gst_annual_return_2026.pdf',
      mimeType: 'application/pdf',
      title: 'Annual GST Compliance Return 2026',
      documentType: 'GST_RETURN',
      category: VAULT_CATEGORIES.COMPLIANCE,
      msmeId: 1,
      user: adminUser,
      metadata: { businessMetadata: { gstin: '27AAAAA0000A1Z5' } },
    });

    assert.ok(asset.assetId, 'Vault Asset ID generated');
    assert.strictEqual(asset.title, 'Annual GST Compliance Return 2026', 'Title saved');
    assert.strictEqual(asset.status, VAULT_STATUSES.VERIFIED, 'Initial status set to VERIFIED');

    const retrievedAsset = await DocumentVault.getAssetById(asset.assetId, adminUser);
    assert.strictEqual(retrievedAsset.assetId, asset.assetId, 'Asset retrieved by ID matches');
    console.log('✔ Vault Asset Ingestion & Repository Storage passed.');

    // 4. Secure Asset Download Stream Test
    console.log('\n[Test 4] Testing Secure Asset Download Stream & Checksum Validation...');
    const downloadRes = await DocumentVault.downloadAsset(asset.assetId, adminUser);
    assert.strictEqual(downloadRes.fileName, 'gst_annual_return_2026.pdf', 'Download filename matches');
    assert.strictEqual(downloadRes.checksum, asset.checksum, 'Download checksum matches');
    assert.strictEqual(downloadRes.buffer.toString(), testBuffer.toString(), 'Download buffer matches');
    console.log('✔ Secure Asset Download Stream passed.');

    // 5. Asset Lifecycle Status Transition Test
    console.log('\n[Test 5] Testing Asset Lifecycle Status Transitions & Auditing...');
    const updatedAsset = await DocumentVault.updateAssetStatus(asset.assetId, VAULT_STATUSES.APPROVED, adminUser, 'Approved by CISO');
    assert.strictEqual(updatedAsset.status, VAULT_STATUSES.APPROVED, 'Status updated to APPROVED');

    const archivedAsset = await DocumentVault.archiveAsset(asset.assetId, adminUser);
    assert.strictEqual(archivedAsset.status, VAULT_STATUSES.ARCHIVED, 'Status updated to ARCHIVED');
    assert.strictEqual(archivedAsset.archivedFlag, true, 'archived_flag set to true');

    const restoredAsset = await DocumentVault.restoreAsset(asset.assetId, adminUser);
    assert.strictEqual(restoredAsset.status, VAULT_STATUSES.RESTORED, 'Status restored to RESTORED');
    assert.strictEqual(restoredAsset.archivedFlag, false, 'archived_flag cleared');
    console.log('✔ Asset Lifecycle Status Transitions passed.');

    // 6. Search Foundation & Metrics Aggregation Test
    console.log('\n[Test 6] Testing Search Foundation & Repository Metrics...');
    const searchRes = await DocumentVault.searchAssets({
      msmeId: 1,
      category: VAULT_CATEGORIES.COMPLIANCE,
      search: 'Annual GST',
    });
    assert.ok(searchRes.assets.length > 0, 'Search assets returned results');

    const metrics = await DocumentVault.getRepositoryMetrics(1);
    assert.ok(metrics.totalAssets > 0, 'Total assets count > 0');
    assert.ok(metrics.mbUsed >= 0, 'Storage MB used calculated');
    console.log(`✔ Repository Metrics passed (Total Assets: ${metrics.totalAssets}, Storage: ${metrics.mbUsed} MB).`);

    // Clean up test file from disk
    await provider.delete(storeRes.storageIdentifier);

    console.log('\n=== ENTERPRISE DOCUMENT VAULT PASSED ALL VERIFICATIONS (PHASE 10.1) ===');
  } catch (err) {
    console.error('\n❌ ENTERPRISE DOCUMENT VAULT TEST FAILED:', err);
    process.exit(1);
  }
}

runDocumentVaultTests();
