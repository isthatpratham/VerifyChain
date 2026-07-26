/**
 * OperationalSettingsService.js
 * Configuration Rollback Engine, Snapshots & History (Phase 11.3).
 */

const defaultPrisma = require('../utils/prismaClient');
const PlatformConfigurationService = require('./PlatformConfigurationService');

class OperationalSettingsService {
  /**
   * List Configuration History & Snapshots
   */
  static async listSnapshots(limit = 20, client = defaultPrisma) {
    return await client.configurationSnapshot.findMany({
      orderBy: { created_at: 'desc' },
      take: Number(limit),
    });
  }

  /**
   * Execute Configuration Rollback to Target Snapshot Version
   */
  static async rollbackToVersion(targetVersion, rollbackBy = 'ADMIN', client = defaultPrisma) {
    const snapshot = await client.configurationSnapshot.findFirst({
      where: { version: Number(targetVersion) },
    });

    if (!snapshot) throw new Error(`Configuration Snapshot Version '${targetVersion}' not found for rollback.`);

    const changes = snapshot.changes_json;
    if (changes && changes.key) {
      await PlatformConfigurationService.updateSetting({
        key: changes.key,
        value: changes.previousValue !== undefined ? changes.previousValue : changes.newValue,
        updatedBy: rollbackBy,
        reason: `Rollback executed to snapshot version ${targetVersion}`,
      }, client);
    }

    return {
      rollbackExecuted: true,
      restoredVersion: targetVersion,
      changes,
      rollbackBy,
      timestamp: new Date(),
    };
  }

  /**
   * System Announcement Publisher & Management
   */
  static async publishAnnouncement({ title, message, severity = 'INFO', targetAudience = 'ALL' }, client = defaultPrisma) {
    return await client.systemAnnouncement.create({
      data: {
        title,
        message,
        severity: severity.toUpperCase(),
        target_audience: targetAudience.toUpperCase(),
        start_time: new Date(),
        is_active: true,
      },
    });
  }

  static async listAnnouncements(client = defaultPrisma) {
    return await client.systemAnnouncement.findMany({
      where: { is_active: true },
      orderBy: { created_at: 'desc' },
    });
  }
}

module.exports = OperationalSettingsService;
