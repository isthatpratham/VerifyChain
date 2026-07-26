/**
 * NotificationConfigurationService.js
 * Notification Channels & Digest Settings (Phase 11.3).
 */

const defaultPrisma = require('../utils/prismaClient');

const NOTIFICATION_CHANNELS = [
  { channel_type: 'EMAIL', is_enabled: true, settings_json: { digestFrequency: 'DAILY', retryLimit: 3 } },
  { channel_type: 'IN_APP', is_enabled: true, settings_json: { autoDismissSecs: 10 } },
  { channel_type: 'SMS', is_enabled: false, settings_json: { provider: 'TWILIO_MOCK' } },
  { channel_type: 'PUSH', is_enabled: false, settings_json: { provider: 'FCM_MOCK' } },
];

class NotificationConfigurationService {
  /**
   * Seed Notification Channels
   */
  static async seedChannels(client = defaultPrisma) {
    const seeded = [];
    for (const c of NOTIFICATION_CHANNELS) {
      const channel = await client.notificationChannelConfig.upsert({
        where: { channel_type: c.channel_type },
        update: { is_enabled: c.is_enabled },
        create: c,
      });
      seeded.push(channel);
    }
    return seeded;
  }

  /**
   * Toggle Channel Status
   */
  static async toggleChannel(channelType, isEnabled, client = defaultPrisma) {
    const typeUpper = channelType.toUpperCase();
    return await client.notificationChannelConfig.upsert({
      where: { channel_type: typeUpper },
      update: { is_enabled: Boolean(isEnabled) },
      create: { channel_type: typeUpper, is_enabled: Boolean(isEnabled) },
    });
  }

  /**
   * List Notification Channels
   */
  static async listChannels(client = defaultPrisma) {
    await this.seedChannels(client);
    return await client.notificationChannelConfig.findMany({
      orderBy: { channel_type: 'asc' },
    });
  }
}

module.exports = NotificationConfigurationService;
