/**
 * ProviderRegistryInitializer.js
 * Idempotent Database Initializer for VerifyChain Built-in Integration Provider Registry.
 * Guarantees that built-in platform providers ship out-of-the-box in PostgreSQL
 * without creating duplicate records or overwriting customer connections.
 */

const defaultPrisma = require('../../utils/prismaClient');
const { BUILTIN_PROVIDERS } = require('./builtinProviders');

class ProviderRegistryInitializer {
  /**
   * Idempotently seeds / synchronizes all built-in enterprise integration providers in PostgreSQL.
   * @param {Object} prismaClient - Optional Prisma client override for testing
   * @returns {Promise<{ initialized: number, updated: number, total: number }>}
   */
  static async initialize(prismaClient = defaultPrisma) {
    let initialized = 0;
    let updated = 0;

    try {
      for (const provider of BUILTIN_PROVIDERS) {
        const metadataPayload = {
          category: provider.category,
          logo: provider.logo,
          supportedAuthMethods: provider.supportedAuthMethods,
          supportedResources: provider.supportedResources,
          docUrl: provider.docUrl,
          healthSupport: provider.healthSupport,
          webhookSupport: provider.webhookSupport,
          syncSupport: provider.syncSupport,
          featureFlags: provider.featureFlags,
          configSchema: provider.configSchema,
          extensibility: provider.extensibility,
        };

        const existing = await prismaClient.integration.findFirst({
          where: { provider_code: provider.providerCode },
        });

        if (!existing) {
          await prismaClient.integration.create({
            data: {
              integration_id: `INT_${provider.providerCode}`,
              name: provider.name,
              description: provider.description,
              type: provider.type,
              provider_code: provider.providerCode,
              version: provider.version,
              status: 'ACTIVE',
              is_system: true,
              capabilities: provider.capabilities,
              metadata: metadataPayload,
            },
          });
          initialized++;
        } else {
          // Idempotent sync of platform metadata & capabilities without touching connections
          await prismaClient.integration.update({
            where: { id: existing.id },
            data: {
              name: provider.name,
              description: provider.description,
              type: provider.type,
              version: provider.version,
              status: 'ACTIVE',
              is_system: true,
              capabilities: provider.capabilities,
              metadata: metadataPayload,
            },
          });
          updated++;
        }
      }

      if (process.env.NODE_ENV !== 'test') {
        console.log(`[ProviderRegistryInitializer] Synchronized ${BUILTIN_PROVIDERS.length} built-in providers (Created: ${initialized}, Updated: ${updated})`);
      }

      return {
        initialized,
        updated,
        total: BUILTIN_PROVIDERS.length,
      };
    } catch (err) {
      console.error('[ProviderRegistryInitializer] Error during provider registry initialization:', err.message);
      throw err;
    }
  }

  /**
   * Helper to retrieve full provider catalog directly from built-in definitions
   */
  static getBuiltinProviders() {
    return BUILTIN_PROVIDERS;
  }
}

module.exports = ProviderRegistryInitializer;
