/**
 * VaultRepository.js
 * Database Persistence Repository for Vault Assets and Metadata.
 */

const defaultPrisma = require('../../utils/prismaClient');
const VaultAsset = require('../domain/VaultAsset');

class VaultRepository {
  /**
   * Create new Vault Asset record
   */
  static async createAsset(assetData, client = defaultPrisma) {
    const record = await client.vaultAsset.create({
      data: {
        asset_id: assetData.assetId,
        title: assetData.title,
        display_name: assetData.displayName,
        original_file_name: assetData.originalFileName,
        storage_identifier: assetData.storageIdentifier,
        storage_provider: assetData.storageProvider || 'LOCAL',
        document_type: assetData.documentType,
        category: assetData.category || 'BUSINESS',
        owner_id: assetData.ownerId ? parseInt(assetData.ownerId, 10) : null,
        msme_id: assetData.msmeId ? parseInt(assetData.msmeId, 10) : 1,
        compliance_category: assetData.complianceCategory || null,
        ai_analysis_reference: assetData.aiAnalysisReference || null,
        status: assetData.status || 'UPLOADING',
        created_by: assetData.createdBy || 'SYSTEM',
        updated_by: assetData.updatedBy || 'SYSTEM',
        retention_policy: assetData.retentionPolicy || 'STANDARD_7_YEARS',
        checksum: assetData.checksum,
        mime_type: assetData.mimeType,
        file_size: parseInt(assetData.fileSize, 10) || 0,
        language: assetData.language || 'en',
        source: assetData.source || 'DIRECT_UPLOAD',
        metadata: assetData.metadata || {},
      },
    });

    if (assetData.tags && Array.isArray(assetData.tags)) {
      for (const tag of assetData.tags) {
        await client.vaultTag.create({
          data: { asset_id: record.id, tag_name: tag },
        });
      }
    }

    return this.mapToDomain(record);
  }

  /**
   * Find Vault Asset by unique assetId (UUID/String)
   */
  static async findByAssetId(assetId, client = defaultPrisma) {
    const record = await client.vaultAsset.findUnique({
      where: { asset_id: assetId },
      include: { tags: true, audits: true },
    });
    return record ? this.mapToDomain(record) : null;
  }

  /**
   * Find Vault Asset by internal DB id
   */
  static async findById(id, client = defaultPrisma) {
    const record = await client.vaultAsset.findUnique({
      where: { id: parseInt(id, 10) },
      include: { tags: true, audits: true },
    });
    return record ? this.mapToDomain(record) : null;
  }

  /**
   * Query Assets with Filters & Pagination
   */
  static async findAssets({
    msmeId,
    ownerId,
    category,
    status,
    documentType,
    complianceCategory,
    search,
    limit = 20,
    offset = 0,
  } = {}, client = defaultPrisma) {
    const where = {
      deleted_flag: false,
    };

    if (msmeId) where.msme_id = parseInt(msmeId, 10);
    if (ownerId) where.owner_id = parseInt(ownerId, 10);
    if (category) where.category = category;
    if (status) where.status = status;
    if (documentType) where.document_type = documentType;
    if (complianceCategory) where.compliance_category = complianceCategory;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { display_name: { contains: search, mode: 'insensitive' } },
        { original_file_name: { contains: search, mode: 'insensitive' } },
        { document_type: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [records, total] = await Promise.all([
      client.vaultAsset.findMany({
        where,
        take: parseInt(limit, 10),
        skip: parseInt(offset, 10),
        orderBy: { created_at: 'desc' },
        include: { tags: true },
      }),
      client.vaultAsset.count({ where }),
    ]);

    return {
      assets: records.map(r => this.mapToDomain(r)),
      total,
      limit,
      offset,
    };
  }

  /**
   * Update Asset Attributes & Status
   */
  static async updateAsset(assetId, updateData, client = defaultPrisma) {
    const existing = await client.vaultAsset.findUnique({ where: { asset_id: assetId } });
    if (!existing) throw new Error(`Vault Asset '${assetId}' not found.`);

    const record = await client.vaultAsset.update({
      where: { asset_id: assetId },
      data: {
        title: updateData.title !== undefined ? updateData.title : existing.title,
        display_name: updateData.displayName !== undefined ? updateData.displayName : existing.display_name,
        status: updateData.status !== undefined ? updateData.status : existing.status,
        archived_flag: updateData.archivedFlag !== undefined ? updateData.archivedFlag : existing.archived_flag,
        deleted_flag: updateData.deletedFlag !== undefined ? updateData.deletedFlag : existing.deleted_flag,
        updated_by: updateData.updatedBy || 'SYSTEM',
        metadata: updateData.metadata !== undefined ? updateData.metadata : existing.metadata,
      },
    });

    return this.mapToDomain(record);
  }

  /**
   * Record Audit Event for Vault Asset
   */
  static async recordAudit({ assetId, action, actorId, oldStatus, newStatus, details, ipAddress }, client = defaultPrisma) {
    const asset = await client.vaultAsset.findUnique({ where: { asset_id: assetId } });
    if (!asset) return null;

    return await client.vaultAssetAudit.create({
      data: {
        asset_id: asset.id,
        action,
        actor_id: actorId || 'SYSTEM',
        old_status: oldStatus || null,
        new_status: newStatus || null,
        details: details || {},
        ip_address: ipAddress || null,
      },
    });
  }

  /**
   * Storage Statistics & Aggregations
   */
  static async getRepositoryMetrics(msmeId = 1, client = defaultPrisma) {
    const where = { msme_id: parseInt(msmeId, 10), deleted_flag: false };

    const [totalAssets, sizeSum, categoryGroups, statusGroups] = await Promise.all([
      client.vaultAsset.count({ where }),
      client.vaultAsset.aggregate({
        where,
        _sum: { file_size: true },
      }),
      client.vaultAsset.groupBy({
        by: ['category'],
        where,
        _count: { id: true },
      }),
      client.vaultAsset.groupBy({
        by: ['status'],
        where,
        _count: { id: true },
      }),
    ]);

    const bytesUsed = sizeSum._sum.file_size || 0;
    const mbUsed = (bytesUsed / (1024 * 1024)).toFixed(2);

    return {
      totalAssets,
      bytesUsed,
      mbUsed: parseFloat(mbUsed),
      categoryBreakdown: categoryGroups.reduce((acc, curr) => {
        acc[curr.category] = curr._count.id;
        return acc;
      }, {}),
      statusBreakdown: statusGroups.reduce((acc, curr) => {
        acc[curr.status] = curr._count.id;
        return acc;
      }, {}),
    };
  }

  /**
   * Map Prisma DB Record to VaultAsset Domain Object
   */
  static mapToDomain(r) {
    return new VaultAsset({
      id: r.id,
      assetId: r.asset_id,
      title: r.title,
      displayName: r.display_name,
      originalFileName: r.original_file_name,
      storageIdentifier: r.storage_identifier,
      storageProvider: r.storage_provider,
      documentType: r.document_type,
      category: r.category,
      ownerId: r.owner_id,
      msmeId: r.msme_id,
      complianceCategory: r.compliance_category,
      aiAnalysisReference: r.ai_analysis_reference,
      status: r.status,
      createdBy: r.created_by,
      updatedBy: r.updated_by,
      archivedFlag: r.archived_flag,
      deletedFlag: r.deleted_flag,
      retentionPolicy: r.retention_policy,
      checksum: r.checksum,
      mimeType: r.mime_type,
      fileSize: r.file_size,
      language: r.language,
      source: r.source,
      currentVersion: r.current_version || 'v1.0',
      metadata: r.metadata || {},
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    });
  }
}

module.exports = VaultRepository;
