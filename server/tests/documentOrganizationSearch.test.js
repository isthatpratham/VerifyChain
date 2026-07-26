/**
 * documentOrganizationSearch.test.js
 * Automated Test Suite for Phase 10.3 Smart Organization & Enterprise Search.
 */

const assert = require('assert');
const {
  DocumentVault,
  FolderService,
  CollectionService,
  TagService,
  ClassificationService,
  RecentActivityService,
  SavedSearchService,
  BulkOperationsService,
  SearchEngine,
} = require('../src/documentVault');

async function runOrganizationSearchTests() {
  console.log('=== STARTING SMART ORGANIZATION & ENTERPRISE SEARCH TEST SUITE (PHASE 10.3) ===\n');

  try {
    const adminUser = { id: 1, role: 'ADMIN', msmeId: 1 };

    // 1. Folder Management Test
    console.log('[Test 1] Testing Enterprise Folder Hierarchy (Root & Nested Folders)...');
    const rootFolder = await FolderService.createFolder({
      name: 'Compliance & Audits 2026',
      description: 'Root folder for annual compliance filings',
      icon: 'Folder',
      color: '#3B82F6',
      msmeId: 1,
    });
    assert.ok(rootFolder.folder_id, 'Root folder_id generated');

    const subFolder = await FolderService.createFolder({
      name: 'GST Submissions',
      description: 'Quarterly GST filings',
      parentId: rootFolder.id,
      color: '#10B981',
      msmeId: 1,
    });
    assert.strictEqual(subFolder.parent_id, rootFolder.id, 'Subfolder parent_id matches root folder');

    const tree = await FolderService.getFolderTree(1);
    assert.ok(tree.length > 0, 'Folder tree returned root folders');

    const details = await FolderService.getFolderDetails(subFolder.folder_id, 1);
    assert.strictEqual(details.breadcrumbs.length, 2, 'Breadcrumbs depth is 2 (Root -> Sub)');
    console.log('✔ Folder Hierarchy & Breadcrumb Tree passed.');

    // 2. Ingest Asset inside Subfolder
    console.log('\n[Test 2] Testing Asset Ingestion inside Nested Folder...');
    const asset = await DocumentVault.ingestAsset({
      fileBuffer: Buffer.from('GST Return Payload 2026 Q1'),
      fileName: 'gst_q1_2026.pdf',
      mimeType: 'application/pdf',
      title: 'GST Return 2026 Q1',
      documentType: 'GST_RETURN',
      category: 'COMPLIANCE',
      msmeId: 1,
      user: adminUser,
    });

    // Move asset into subfolder
    await BulkOperationsService.bulkMove({
      assetIds: [asset.assetId],
      targetFolderId: subFolder.folder_id,
      msmeId: 1,
      user: adminUser,
    });

    const folderDetailsAfterMove = await FolderService.getFolderDetails(subFolder.folder_id, 1);
    assert.strictEqual(folderDetailsAfterMove.folder.documentCount, 1, 'Subfolder document count updated to 1');
    console.log('✔ Asset assigned to subfolder & folder metrics updated.');

    // 3. Smart Dynamic Collections Test
    console.log('\n[Test 3] Testing Smart Dynamic Collections...');
    const collections = await CollectionService.listCollections(1);
    assert.ok(collections.length >= 5, 'System collections seeded (at least 5)');

    const gstCollection = collections.find(c => c.name === 'GST & Tax Documents');
    assert.ok(gstCollection, 'GST collection exists');

    const evaluation = await CollectionService.evaluateCollection(gstCollection.collection_id, 1);
    assert.ok(evaluation.matchingCount > 0, 'Collection evaluated dynamic filter matching assets');
    console.log(`✔ Smart Collections evaluated (${evaluation.matchingCount} asset(s) matched).`);

    // 4. Tagging & Bulk Tagging Test
    console.log('\n[Test 4] Testing Tag Management & Bulk Tagging...');
    const tagRes = await TagService.tagAssets({
      assetIds: [asset.assetId],
      tags: ['FY2026', 'GST', 'URGENT'],
      color: '#EF4444',
      msmeId: 1,
    });
    assert.strictEqual(tagRes.associationsCreated, 3, '3 tag associations created');

    const allTags = await TagService.getTags(1);
    assert.ok(allTags.length >= 3, 'Tags created in MSME dictionary');
    console.log('✔ Tag Management & Bulk Tagging passed.');

    // 5. Classification Taxonomy Test
    console.log('\n[Test 5] Testing Classification Taxonomy Tree...');
    const taxonomy = await ClassificationService.getTaxonomy(1);
    assert.ok(taxonomy.length >= 6, 'Taxonomy seeded with standard enterprise categories');
    console.log('✔ Classification Taxonomy passed.');

    // 6. Recent Activity & Favorites Test
    console.log('\n[Test 6] Testing Recent Activity Logging & Favorites...');
    await RecentActivityService.logActivity({
      userId: 1,
      assetId: asset.assetId,
      activityType: 'VIEWED',
      msmeId: 1,
    });

    const activities = await RecentActivityService.getRecentActivities(1, 1);
    assert.ok(activities.length > 0, 'Recent activities retrieved');

    const favRes = await RecentActivityService.toggleFavorite({
      userId: 'USER_101',
      assetId: asset.assetId,
      isPinned: true,
      msmeId: 1,
    });
    assert.strictEqual(favRes.favorited, true, 'Asset favorited & pinned');

    const favs = await RecentActivityService.getFavorites('USER_101', 1);
    assert.ok(favs.length >= 1, 'User favorites list retrieved');
    console.log('✔ Recent Activity Logging & Favorites passed.');

    // 7. Saved Search Presets Test
    console.log('\n[Test 7] Testing Saved Search Query Presets...');
    const savedSearch = await SavedSearchService.saveSearch({
      userId: 1,
      name: 'GST Expiring Query',
      query: 'GST',
      filters: { category: 'COMPLIANCE' },
      isPinned: true,
      msmeId: 1,
    });
    assert.ok(savedSearch.search_id, 'Saved search ID generated');

    const savedSearches = await SavedSearchService.listSavedSearches(1, 1);
    assert.ok(savedSearches.length >= 1, 'User saved search list retrieved');
    console.log('✔ Saved Search Presets passed.');

    // 8. Bulk Operations Test
    console.log('\n[Test 8] Testing Bulk Operations (Bulk Categorize & Bulk Metadata Export)...');
    const bulkCatRes = await BulkOperationsService.bulkCategorize({
      assetIds: [asset.assetId],
      category: 'FINANCIAL',
      documentType: 'TAX_FILING',
      msmeId: 1,
    });
    assert.strictEqual(bulkCatRes.categorizedCount, 1, 'Bulk categorize count is 1');

    const exportedMetadata = await BulkOperationsService.bulkExportMetadata({
      assetIds: [asset.assetId],
      msmeId: 1,
    });
    assert.strictEqual(exportedMetadata.length, 1, 'Bulk exported metadata count is 1');
    console.log('✔ Bulk Operations passed.');

    // 9. Enterprise Advanced Search Engine Test
    console.log('\n[Test 9] Testing Enterprise Advanced Search Engine...');
    const searchRes = await SearchEngine.search({
      query: 'GST',
      category: 'FINANCIAL',
      msmeId: 1,
    });
    assert.ok(searchRes.results.length > 0, 'Advanced Search returned matching results');
    console.log(`✔ Advanced Search Engine found ${searchRes.results.length} matching result(s).`);

    console.log('\n=== SMART ORGANIZATION & ENTERPRISE SEARCH PASSED ALL VERIFICATIONS (PHASE 10.3) ===');
  } catch (err) {
    console.error('\n❌ SMART ORGANIZATION & ENTERPRISE SEARCH TEST FAILED:', err);
    process.exit(1);
  }
}

runOrganizationSearchTests();
