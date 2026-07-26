/**
 * StorageProviderManager.js
 * Multi-Cloud Storage Provider Manager & Credentials Masking (Phase 11.3).
 */

const defaultPrisma = require('../utils/prismaClient');

const STORAGE_PROVIDERS = [
  { provider_type: 'LOCAL', name: 'Local File System Storage', is_active: true },
  { provider_type: 'AWS_S3', name: 'Amazon S3 Object Storage', is_active: false },
  { provider_type: 'AZURE_BLOB', name: 'Azure Blob Storage', is_active: false },
  { provider_type: 'GCS', name: 'Google Cloud Storage', is_active: false },
  { provider_type: 'R2', name: 'Cloudflare R2 Storage', is_active: false },
  { provider_type: 'MINIO', name: 'MinIO Private Cloud Storage', is_active: false },
];

class StorageProviderManager {
  /**
   * Seed Storage Providers
   */
  static async seedProviders(client = defaultPrisma) {
    const seeded = [];
    for (const p of STORAGE_PROVIDERS) {
      const provider = await client.storageProviderConfig.upsert({
        where: { provider_type: p.provider_type },
        update: { name: p.name },
        create: p,
      });
      seeded.push(provider);
    }
    return seeded;
  }

  /**
   * Activate & Configure Storage Provider
   */
  static async setStorageProvider({ providerType, configData = {}, updatedBy = 'ADMIN' }, client = defaultPrisma) {
    const typeUpper = providerType.toUpperCase();
    await client.storageProviderConfig.updateMany({
      data: { is_active: false },
    });

    const maskedCreds = {
      bucketName: configData.bucketName || 'verifychain-vault',
      region: configData.region || 'ap-south-1',
      accessKey: configData.accessKey ? '********' : undefined,
    };

    const activeProvider = await client.storageProviderConfig.upsert({
      where: { provider_type: typeUpper },
      update: {
        is_active: true,
        credentials_masked_json: maskedCreds,
        health_status: 'HEALTHY',
        updated_by: String(updatedBy),
      },
      create: {
        provider_type: typeUpper,
        name: `${typeUpper} Storage`,
        is_active: true,
        credentials_masked_json: maskedCreds,
        health_status: 'HEALTHY',
        updated_by: String(updatedBy),
      },
    });

    return activeProvider;
  }

  /**
   * List Storage Providers
   */
  static async listProviders(client = defaultPrisma) {
    await this.seedProviders(client);
    return await client.storageProviderConfig.findMany({
      orderBy: { provider_type: 'asc' },
    });
  }
}

module.exports = StorageProviderManager;
