/**
 * auditPipeline.test.js
 * Automated Verification Test Suite for Centralized Enterprise Audit Pipeline.
 */

const assert = require('assert');
const AuditPublisher = require('../src/audit/AuditPublisher');
const AuditService = require('../src/audit/AuditService');
const domainEventBus = require('../src/events/DomainEventBus');
const authService = require('../src/services/auth.service');

async function runAuditPipelineTests() {
  console.log('=== STARTING ENTERPRISE AUDIT PIPELINE TEST SUITE ===\n');

  try {
    // 1. Direct AuditPublisher Event Publishing
    console.log('[Test 1] Testing direct AuditPublisher.publish()...');
    const directLog = await AuditPublisher.publish({
      actorType: 'USER',
      actorId: 'USER_TEST_101',
      msmeId: 101,
      module: 'DEVELOPER_PLATFORM',
      action: 'API_KEY_CREATED',
      resourceType: 'ApiKey',
      resourceId: 'key_live_test123',
      severity: 'INFO',
      status: 'SUCCESS',
      changes: { scopeCount: 4, name: 'Production Integration Key' },
    });

    assert.ok(directLog, 'Direct log should be persisted');
    assert.strictEqual(directLog.action, 'API_KEY_CREATED');
    console.log('✔ Direct AuditPublisher.publish() passed.');

    // 2. Helper Method Publishing (Auth, Security, System)
    console.log('\n[Test 2] Testing AuditPublisher helper methods...');

    const authLog = await AuditPublisher.publishAuth({
      actorId: 'USER_505',
      msmeId: 101,
      action: 'AUTH_LOGIN_SUCCESS',
      status: 'SUCCESS',
      details: { role: 'MSME_OWNER' },
    });
    assert.ok(authLog, 'Auth audit record created');
    assert.strictEqual(authLog.module, 'AUTH');

    const secLog = await AuditPublisher.publishSecurity({
      actorId: 'ANONYMOUS',
      msmeId: 101,
      action: 'PERMISSION_DENIED',
      severity: 'WARNING',
      status: 'FAILURE',
      details: { requiredScope: 'admin.write' },
    });
    assert.ok(secLog, 'Security audit record created');
    assert.strictEqual(secLog.severity, 'WARNING');

    const sysLog = await AuditPublisher.publishSystem({
      action: 'SYSTEM_STARTUP',
      status: 'SUCCESS',
      details: { version: '1.0.0' },
    });
    assert.ok(sysLog, 'System audit record created');
    assert.strictEqual(sysLog.module, 'SYSTEM');
    console.log('✔ AuditPublisher helper methods passed.');

    // 3. DomainEventBus Automatic Audit Conversion
    console.log('\n[Test 3] Testing DomainEventBus automatic audit translation...');
    domainEventBus.publish('BusinessCreated', { msmeId: 202, name: 'Apex Logistics Ltd' });
    domainEventBus.publish('ComplianceEvaluated', { msmeId: 202, requirementId: 'GST_FILING', score: 98 });
    domainEventBus.publish('SupplierTrustProfileCreated', { msmeId: 202, profileId: 'trust_202' });
    domainEventBus.publish('FutureQRGenerated', { msmeId: 202, qrCodeId: 'qr_202_live' });

    // Wait 200ms for async event processing
    await new Promise((r) => setTimeout(r, 200));

    const domainQueryResult = await AuditService.searchAuditLogs({ msmeId: 202, limit: 20 });
    assert.ok(domainQueryResult.logs.length >= 4, `Expected at least 4 audit logs for MSME 202, got ${domainQueryResult.logs.length}`);
    console.log(`✔ DomainEventBus auto-translation created ${domainQueryResult.logs.length} audit logs.`);

    // 4. AuditService Search & Filtering
    console.log('\n[Test 4] Testing AuditService search, module filtering, and pagination...');
    const authFiltered = await AuditService.searchAuditLogs({ msmeId: 101, module: 'AUTH' });
    assert.ok(authFiltered.logs.every((l) => l.module === 'AUTH'), 'Module filter should match AUTH');

    const warningFiltered = await AuditService.searchAuditLogs({ msmeId: 101, severity: 'WARNING' });
    assert.ok(warningFiltered.logs.every((l) => l.severity === 'WARNING'), 'Severity filter should match WARNING');

    const searchFiltered = await AuditService.searchAuditLogs({ msmeId: 101, search: 'API_KEY' });
    assert.ok(searchFiltered.logs.length > 0, 'Search filter should find API_KEY logs');
    console.log('✔ AuditService search & multi-field filtering passed.');

    // 5. Bookmarking & Exporting
    console.log('\n[Test 5] Testing Bookmarking & Audit Log Export...');
    const sampleLog = directLog.id;
    const bookmark = await AuditService.bookmarkAuditLog(101, sampleLog, 'Important API key audit event');
    assert.ok(bookmark, 'Bookmark should be created');

    const jsonExport = await AuditService.exportAuditLogs({ msmeId: 101, format: 'json' });
    assert.strictEqual(jsonExport.format, 'json');
    assert.ok(jsonExport.content.includes('API_KEY_CREATED'), 'JSON export contains audit content');

    const csvExport = await AuditService.exportAuditLogs({ msmeId: 101, format: 'csv' });
    assert.strictEqual(csvExport.format, 'csv');
    assert.ok(csvExport.content.includes('Timestamp'), 'CSV export contains header');

    await AuditService.removeBookmark(101, sampleLog);
    console.log('✔ Bookmarking & JSON/CSV exporting passed.');

    console.log('\n=== ENTERPRISE AUDIT PIPELINE PASSED ALL VERIFICATIONS ===');
  } catch (err) {
    console.error('\n❌ AUDIT PIPELINE TEST FAILED:', err);
    process.exit(1);
  }
}

runAuditPipelineTests();
