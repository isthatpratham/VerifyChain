/**
 * EmailConfigurationService.js
 * Email Providers (SMTP, SendGrid, SES, Mailgun) & Sender Identity Manager (Phase 11.3).
 */

const defaultPrisma = require('../utils/prismaClient');

const EMAIL_PROVIDERS = [
  { provider_type: 'SMTP', sender_email: 'noreply@verifychain.io', sender_name: 'VerifyChain Platform', is_active: true },
  { provider_type: 'SENDGRID', sender_email: 'alerts@verifychain.io', sender_name: 'VerifyChain Alerts', is_active: false },
  { provider_type: 'AWS_SES', sender_email: 'system@verifychain.io', sender_name: 'VerifyChain System', is_active: false },
  { provider_type: 'MAILGUN', sender_email: 'mail@verifychain.io', sender_name: 'VerifyChain Notifications', is_active: false },
];

class EmailConfigurationService {
  /**
   * Seed Email Providers
   */
  static async seedEmailProviders(client = defaultPrisma) {
    const seeded = [];
    for (const e of EMAIL_PROVIDERS) {
      const provider = await client.emailProviderConfig.upsert({
        where: { provider_type: e.provider_type },
        update: { sender_email: e.sender_email, sender_name: e.sender_name },
        create: e,
      });
      seeded.push(provider);
    }
    return seeded;
  }

  /**
   * Configure & Activate Email Provider
   */
  static async configureEmailProvider({ providerType, senderEmail, senderName, settings = {} }, client = defaultPrisma) {
    const typeUpper = providerType.toUpperCase();
    await client.emailProviderConfig.updateMany({ data: { is_active: false } });

    const maskedSettings = {
      smtpHost: settings.smtpHost || 'smtp.verifychain.io',
      smtpPort: settings.smtpPort || 587,
      username: settings.username || 'smtp_user',
      password: settings.password ? '********' : undefined,
    };

    const activeProvider = await client.emailProviderConfig.upsert({
      where: { provider_type: typeUpper },
      update: {
        sender_email: senderEmail || 'noreply@verifychain.io',
        sender_name: senderName || 'VerifyChain Platform',
        is_active: true,
        settings_masked_json: maskedSettings,
        health_status: 'HEALTHY',
      },
      create: {
        provider_type: typeUpper,
        sender_email: senderEmail || 'noreply@verifychain.io',
        sender_name: senderName || 'VerifyChain Platform',
        is_active: true,
        settings_masked_json: maskedSettings,
        health_status: 'HEALTHY',
      },
    });

    return activeProvider;
  }

  /**
   * List Email Providers
   */
  static async listEmailProviders(client = defaultPrisma) {
    await this.seedEmailProviders(client);
    return await client.emailProviderConfig.findMany({
      orderBy: { provider_type: 'asc' },
    });
  }
}

module.exports = EmailConfigurationService;
