/**
 * enterpriseOperations.test.js
 * Comprehensive Automated Test Suite for Phase 11.3 Enterprise Platform Operations & System Configuration.
 */

const assert = require('assert');
const {
  OperationsFacade,
  PlatformConfigurationService,
  FeatureManagementService,
  SystemSettingsService,
  StorageProviderManager,
  IntegrationRegistry,
  EmailConfigurationService,
  NotificationConfigurationService,
  BrandingManager,
  OperationalSettingsService,
} = require('../src/operations');

async function runEnterpriseOperationsTests() {
  console.log('================================================================');
  console.log('  STARTING ENTERPRISE OPERATIONS & CONFIGURATION TEST SUITE (11.3)');
  console.log('================================================================\n');

  try {
    // ─── TEST 1: GLOBAL PLATFORM SETTINGS & SNAPSHOT CREATION ────────────
    console.log('[Test 1] Testing Global Platform Settings & Immutable Snapshot Generation...');
    const settings = await OperationsFacade.seedDefaultSettings();
    assert.ok(settings.length >= 10, 'Default global settings seeded');

    const updatedSetting = await OperationsFacade.updateSetting({
      key: 'security.session_timeout_mins',
      value: 120,
      category: 'SECURITY',
      reason: 'Expanded enterprise session timeout to 120 minutes',
    });
    assert.strictEqual(updatedSetting.key, 'security.session_timeout_mins', 'Setting key matches');

    const val = await OperationsFacade.getSetting('security.session_timeout_mins');
    assert.strictEqual(val, 120, 'Updated value returned correctly');
    console.log('✔ Global Platform Settings & Snapshot passed.');

    // ─── TEST 2: ENTERPRISE FEATURE FLAGS EVALUATION ─────────────────────
    console.log('\n[Test 2] Testing Enterprise Feature Flags & Evaluation Engine...');
    const flags = await OperationsFacade.listFeatureFlags();
    assert.ok(flags.length >= 5, 'Default feature flags registered');

    const isAiEnabled = await OperationsFacade.isFeatureEnabled('ai.assistant');
    assert.strictEqual(isAiEnabled, true, 'ai.assistant flag evaluated as true');

    const toggledFlag = await OperationsFacade.updateFeatureFlag({
      key: 'experimental.blockchain_notary',
      isEnabled: true,
    });
    assert.strictEqual(toggledFlag.is_enabled, true, 'Experimental flag toggled to true');
    console.log('✔ Enterprise Feature Flags passed.');

    // ─── TEST 3: STORAGE PROVIDERS & CREDENTIALS MASKING ──────────────────
    console.log('\n[Test 3] Testing Multi-Cloud Storage Providers & Credentials Masking...');
    const providers = await OperationsFacade.listStorageProviders();
    assert.ok(providers.length >= 6, '6 standard storage providers seeded');

    const s3Config = await OperationsFacade.setStorageProvider({
      providerType: 'AWS_S3',
      configData: { bucketName: 'prod-verifychain-vault', region: 'ap-south-1', accessKey: 'SECRET_KEY_123' },
    });
    assert.strictEqual(s3Config.provider_type, 'AWS_S3', 'S3 set as active storage provider');
    assert.strictEqual(s3Config.credentials_masked_json.accessKey, '********', 'Access key credential masked safely');
    console.log('✔ Storage Providers & Credentials Masking passed.');

    // ─── TEST 4: INTEGRATION REGISTRY & HEALTH CHECKS ────────────────────
    console.log('\n[Test 4] Testing Integration Registry & Health Checks...');
    const integrations = await OperationsFacade.listIntegrations();
    assert.ok(integrations.length >= 5, 'Registered integrations listed');

    const healthResults = await OperationsFacade.runHealthChecks();
    assert.ok(healthResults.every(i => i.health_status === 'HEALTHY'), 'All integrations passed health check');
    console.log('✔ Integration Registry & Health Checks passed.');

    // ─── TEST 5: EMAIL & NOTIFICATION CHANNELS CONFIGURATION ──────────────
    console.log('\n[Test 5] Testing Email Provider & Notification Channels...');
    const emailConfig = await OperationsFacade.configureEmailProvider({
      providerType: 'SMTP',
      senderEmail: 'notifications@verifychain.io',
      senderName: 'VerifyChain Global',
    });
    assert.strictEqual(emailConfig.sender_email, 'notifications@verifychain.io', 'Sender email configured');

    const channelRes = await OperationsFacade.toggleNotificationChannel('SMS', true);
    assert.strictEqual(channelRes.is_enabled, true, 'SMS channel enabled');
    console.log('✔ Email & Notification Channels passed.');

    // ─── TEST 6: BRANDING & WHITE-LABEL CUSTOMIZATION ─────────────────────
    console.log('\n[Test 6] Testing Branding Manager & Custom Colors...');
    const branding = await OperationsFacade.updateBranding({
      platformName: 'VerifyChain Global Enterprise',
      primaryColor: '#0b132b',
      accentColor: '#3a86ff',
    });
    assert.strictEqual(branding.platform_name, 'VerifyChain Global Enterprise', 'Platform name updated');
    assert.strictEqual(branding.primary_color, '#0b132b', 'Primary color updated');
    console.log('✔ Branding & Custom Colors passed.');

    // ─── TEST 7: SYSTEM ANNOUNCEMENTS & MAINTENANCE MODE ──────────────────
    console.log('\n[Test 7] Testing System Announcements & Maintenance Mode Toggle...');
    const announcement = await OperationsFacade.publishAnnouncement({
      title: 'Scheduled Infrastructure Upgrade',
      message: 'System upgrade scheduled for Sunday at 02:00 UTC',
      severity: 'WARNING',
    });
    assert.ok(announcement.id, 'Announcement published');

    const maintRes = await OperationsFacade.setMaintenanceMode(true, 'Infrastructure patch window');
    assert.strictEqual(maintRes.value_json, true, 'Maintenance mode enabled');

    await OperationsFacade.setMaintenanceMode(false, 'Patch window complete');
    console.log('✔ System Announcements & Maintenance Mode passed.');

    // ─── TEST 8: CONFIGURATION ROLLBACK ENGINE ────────────────────────────
    console.log('\n[Test 8] Testing Configuration Rollback Engine & Dashboard Metrics...');
    const snapshots = await OperationsFacade.listSnapshots(5);
    assert.ok(snapshots.length > 0, 'Snapshots listed');

    const firstSnapshot = snapshots[snapshots.length - 1];
    const rollbackRes = await OperationsFacade.rollbackToVersion(firstSnapshot.version, 'SUPER_ADMIN');
    assert.strictEqual(rollbackRes.rollbackExecuted, true, 'Rollback executed successfully');

    const dashboard = await OperationsFacade.getOperationsDashboardStats();
    assert.ok(dashboard.settingsCount > 0, 'Dashboard settings count > 0');
    assert.ok(dashboard.flagsCount > 0, 'Dashboard flags count > 0');
    console.log(`✔ Configuration Rollback & Operations Dashboard passed (Settings: ${dashboard.settingsCount}, Flags: ${dashboard.flagsCount}).`);

    console.log('\n================================================================');
    console.log('  ENTERPRISE OPERATIONS & CONFIGURATION PASSED ALL VERIFICATIONS!');
    console.log('================================================================');
  } catch (err) {
    console.error('\n❌ ENTERPRISE OPERATIONS TEST FAILED:', err);
    process.exit(1);
  }
}

runEnterpriseOperationsTests();
