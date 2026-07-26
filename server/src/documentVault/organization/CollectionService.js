/**
 * CollectionService.js
 * Smart Dynamic Collections & Custom Filter Collections Service (Phase 10.3).
 * Evaluates dynamic rules (e.g. Recently Uploaded, Expiring Soon, AI Reviewed, High Risk) against repository assets.
 */

const defaultPrisma = require('../../utils/prismaClient');

const SYSTEM_COLLECTIONS = [
  {
    name: 'Recently Uploaded',
    description: 'Assets ingested within the last 7 days',
    icon: 'Clock',
    color: '#3B82F6',
    filterRules: { createdWithinDays: 7 },
  },
  {
    name: 'GST & Tax Documents',
    description: 'GST, PAN, Income Tax Returns & filings',
    icon: 'FileText',
    color: '#10B981',
    filterRules: { category: 'COMPLIANCE', documentType: 'GST_RETURN' },
  },
  {
    name: 'High Risk & Action Required',
    description: 'Documents flagged with compliance risks or pending approval',
    icon: 'WarningCircle',
    color: '#EF4444',
    filterRules: { status: 'PENDING_APPROVAL', riskLevel: 'HIGH' },
  },
  {
    name: 'AI Analyzed & Extracted',
    description: 'Processed by AI Document Intelligence',
    icon: 'Sparkle',
    color: '#8B5CF6',
    filterRules: { hasAiAnalysis: true },
  },
  {
    name: 'Supplier & Vendor Vault',
    description: 'Contracts, NDAs, and supplier onboarding credentials',
    icon: 'ShieldCheck',
    color: '#F59E0B',
    filterRules: { category: 'SUPPLIER' },
  },
];

class CollectionService {
  /**
   * Seed System Collections for MSME
   */
  static async seedSystemCollections(msmeId = 1, client = defaultPrisma) {
    for (const sc of SYSTEM_COLLECTIONS) {
      const existing = await client.vaultCollection.findFirst({
        where: { msme_id: msmeId, name: sc.name },
      });
      if (!existing) {
        await client.vaultCollection.create({
          data: {
            msme_id: msmeId,
            name: sc.name,
            description: sc.description,
            filter_rules: sc.filterRules,
            icon: sc.icon,
            color: sc.color,
            is_system: true,
          },
        });
      }
    }
  }

  /**
   * List All Collections for MSME
   */
  static async listCollections(msmeId = 1, client = defaultPrisma) {
    await this.seedSystemCollections(msmeId, client);

    const collections = await client.vaultCollection.findMany({
      where: { msme_id: msmeId },
      orderBy: [{ is_system: 'desc' }, { name: 'asc' }],
    });

    return collections;
  }

  /**
   * Evaluate Collection Filter Rules and Return Matching Assets
   */
  static async evaluateCollection(collectionId, msmeId = 1, client = defaultPrisma) {
    const col = await client.vaultCollection.findFirst({
      where: {
        OR: [
          { collection_id: collectionId },
          { id: isNaN(Number(collectionId)) ? -1 : Number(collectionId) },
        ],
        msme_id: msmeId,
      },
    });

    if (!col) throw new Error(`Collection '${collectionId}' not found.`);

    const rules = col.filter_rules || {};
    const where = { msme_id: msmeId, deleted_flag: false };

    if (rules.category) where.category = rules.category;
    if (rules.documentType) where.document_type = rules.documentType;
    if (rules.status) where.status = rules.status;
    if (rules.createdWithinDays) {
      const dateCutoff = new Date();
      dateCutoff.setDate(dateCutoff.getDate() - rules.createdWithinDays);
      where.created_at = { gte: dateCutoff };
    }

    const assets = await client.vaultAsset.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: 100,
    });

    return {
      collection: col,
      matchingCount: assets.length,
      assets,
    };
  }

  /**
   * Create Custom Collection
   */
  static async createCollection({ name, description, filterRules, icon = 'Sparkle', color = '#6366F1', msmeId = 1, createdBy = 'SYSTEM' }, client = defaultPrisma) {
    if (!name || !name.trim()) throw new Error('Collection name is required.');

    return await client.vaultCollection.create({
      data: {
        msme_id: msmeId,
        name: name.trim(),
        description,
        filter_rules: filterRules || {},
        icon,
        color,
        is_system: false,
        created_by: createdBy,
      },
    });
  }
}

module.exports = CollectionService;
