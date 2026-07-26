/**
 * documentCollaboration.test.js
 * Automated Test Suite for Phase 10.4 Enterprise Sharing, Permissions & Collaboration.
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
} = require('../src/documentVault');

async function runCollaborationTests() {
  console.log('=== STARTING ENTERPRISE COLLABORATION & PERMISSIONS TEST SUITE (PHASE 10.4) ===\n');

  try {
    const adminUser = { id: 1, role: 'ADMIN', msmeId: 1 };
    const reviewerUser = { id: 102, role: 'REVIEWER', msmeId: 1 };
    const viewerUser = { id: 205, role: 'VIEWER', msmeId: 1 };

    // 1. Ingest Sample Asset for Collaboration Testing
    console.log('[Test 1] Ingesting Vault Asset for Collaboration Workspace...');
    const asset = await DocumentVault.ingestAsset({
      fileBuffer: Buffer.from('Enterprise SLA & Terms Agreement 2026'),
      fileName: 'sla_agreement_2026.pdf',
      mimeType: 'application/pdf',
      title: 'Enterprise SLA Agreement 2026',
      documentType: 'LEGAL_AGREEMENT',
      category: 'LEGAL',
      msmeId: 1,
      user: adminUser,
    });
    assert.ok(asset.assetId, 'Asset ingested with assetId');
    console.log('✔ Asset created for collaboration testing.');

    // 2. Permission Engine Evaluation Test
    console.log('\n[Test 2] Testing Permission Engine & Least Privilege Evaluation...');
    const adminAccess = await VaultPermissionEngine.evaluateAccess({
      user: adminUser,
      assetId: asset.assetId,
      requestedAction: 'delete',
      msmeId: 1,
    });
    assert.strictEqual(adminAccess.allowed, true, 'ADMIN role allowed to delete asset');

    const viewerAccess = await VaultPermissionEngine.evaluateAccess({
      user: viewerUser,
      assetId: asset.assetId,
      requestedAction: 'delete',
      msmeId: 1,
    });
    assert.strictEqual(viewerAccess.allowed, false, 'VIEWER role denied delete action');
    console.log('✔ Permission Engine least privilege evaluation passed.');

    // 3. Internal Sharing & Revocation Test
    console.log('\n[Test 3] Testing Secure Internal Sharing & Grant Revocation...');
    const shareGrant = await SharingService.shareAsset({
      assetId: asset.assetId,
      targetType: 'USER',
      targetId: '205',
      accessLevel: 'COMMENT',
      note: 'Please review and comment on SLA clause 4.2',
      sharedBy: 'USER_1',
      msmeId: 1,
    });
    assert.ok(shareGrant.share_id, 'Share grant generated');

    const activeShares = await SharingService.listAssetShares(asset.assetId, 1);
    assert.strictEqual(activeShares.length, 1, '1 active share grant listed for asset');

    const incomingShares = await SharingService.listIncomingShares(205, 1);
    assert.strictEqual(incomingShares.length, 1, 'Incoming share received by user 205');

    // Test access after share grant
    const viewerCommentAccess = await VaultPermissionEngine.evaluateAccess({
      user: viewerUser,
      assetId: asset.assetId,
      requestedAction: 'comment',
      msmeId: 1,
    });
    assert.strictEqual(viewerCommentAccess.allowed, true, 'VIEWER granted comment permission via explicit share');

    // Revoke share grant
    await SharingService.revokeShare(shareGrant.share_id, 1);
    const sharesAfterRevoke = await SharingService.listAssetShares(asset.assetId, 1);
    assert.strictEqual(sharesAfterRevoke[0].is_revoked, true, 'Share grant marked revoked');
    console.log('✔ Internal Sharing & Revocation passed.');

    // 4. Threaded Comments & @Mentions Test
    console.log('\n[Test 4] Testing Threaded Discussions & @Mentions Parsing...');
    const rootComment = await CommentService.addComment({
      assetId: asset.assetId,
      userId: 102,
      userName: 'Jane Compliance',
      content: 'Clause 4.2 needs update @User_1 and @Role_Admin please review.',
      msmeId: 1,
    });
    assert.ok(rootComment.comment_id, 'Root comment created');
    assert.strictEqual(rootComment.parsedMentions.length, 2, '2 @mentions extracted (@User_1 and @Role_Admin)');

    const replyComment = await CommentService.addComment({
      assetId: asset.assetId,
      userId: 1,
      userName: 'Admin User',
      content: 'Updated clause looks good to merge.',
      parentId: rootComment.id,
      msmeId: 1,
    });
    assert.strictEqual(replyComment.parent_id, rootComment.id, 'Threaded reply linked to root comment');

    const threadedComments = await CommentService.getComments(asset.assetId, 1);
    assert.strictEqual(threadedComments.length, 1, '1 root comment thread found');
    assert.strictEqual(threadedComments[0].replies.length, 1, 'Root comment has 1 reply');

    // Resolve comment thread
    const resolved = await CommentService.resolveComment({
      commentId: rootComment.comment_id,
      userId: 1,
      isResolved: true,
      msmeId: 1,
    });
    assert.strictEqual(resolved.is_resolved, true, 'Comment thread marked resolved');
    console.log('✔ Threaded Discussions & @Mentions passed.');

    // 5. Document Watcher Subscription Test
    console.log('\n[Test 5] Testing Document Watcher Subscriptions...');
    const watch1 = await DocumentWatchService.toggleWatch({ assetId: asset.assetId, userId: 102, msmeId: 1 });
    assert.strictEqual(watch1.isWatching, true, 'User 102 subscribed to asset updates');

    const watchers = await DocumentWatchService.getWatchers(asset.assetId, 1);
    assert.strictEqual(watchers.length, 1, '1 watcher active for asset');
    console.log('✔ Document Watcher Subscriptions passed.');

    // 6. Review Request Workflow Foundation Test
    console.log('\n[Test 6] Testing Review Request Workflow Foundation...');
    const reviewReq = await ReviewRequestService.createReviewRequest({
      assetId: asset.assetId,
      requesterId: 1,
      title: 'Annual SLA Legal Review',
      priority: 'HIGH',
      reviewers: ['102'],
      msmeId: 1,
    });
    assert.ok(reviewReq.request_id, 'Review request ID generated');
    assert.strictEqual(reviewReq.status, 'PENDING', 'Review request status is PENDING');

    const updatedReview = await ReviewRequestService.updateReviewStatus({
      requestId: reviewReq.request_id,
      reviewerId: 102,
      status: 'COMPLETED',
      notes: 'All SLA compliance requirements verified.',
      msmeId: 1,
    });
    assert.strictEqual(updatedReview.status, 'COMPLETED', 'Overall review request marked COMPLETED');
    console.log('✔ Review Request Workflow passed.');

    // 7. Activity Feed & Notification Pipeline Test
    console.log('\n[Test 7] Testing Collaboration Activity Feed...');
    const feed = await CollaborationFeedService.getActivityFeed({ assetId: asset.assetId, limit: 10, msmeId: 1 });
    assert.ok(feed.length >= 4, 'Activity feed generated for asset events (share, comment, watch, review)');

    const notifHook = await CollaborationFeedService.triggerNotificationHook({
      recipientId: '102',
      eventType: 'REVIEW_REQUESTED',
      title: 'New Review Assigned',
      message: 'You have been assigned to review Enterprise SLA Agreement 2026',
    });
    assert.strictEqual(notifHook.delivered, true, 'Notification hook dispatched to recipient');
    console.log('✔ Activity Feed & Notification Pipeline passed.');

    console.log('\n=== ENTERPRISE SHARING, PERMISSIONS & COLLABORATION PASSED ALL VERIFICATIONS (PHASE 10.4) ===');
  } catch (err) {
    console.error('\n❌ COLLABORATION TEST FAILED:', err);
    process.exit(1);
  }
}

runCollaborationTests();
