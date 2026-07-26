/**
 * ClassificationService.js
 * Hierarchical Document Classification Taxonomy Service (Phase 10.3).
 */

const defaultPrisma = require('../../utils/prismaClient');

const SYSTEM_CLASSIFICATIONS = [
  { name: 'Compliance', code: 'COMPLIANCE', description: 'Regulatory, GST, PAN, ISO credentials' },
  { name: 'GST Filing', code: 'COMPLIANCE.GST', parentCode: 'COMPLIANCE' },
  { name: 'PAN & Tax Records', code: 'COMPLIANCE.PAN', parentCode: 'COMPLIANCE' },
  { name: 'Finance & Invoices', code: 'FINANCE', description: 'Financial statements, invoices, tax files' },
  { name: 'Legal Agreements', code: 'LEGAL', description: 'Contracts, NDAs, licenses' },
  { name: 'Supplier Credentials', code: 'SUPPLIER', description: 'Vendor onboarding certificates' },
];

class ClassificationService {
  /**
   * Seed System Classification Taxonomy
   */
  static async seedClassifications(msmeId = 1, client = defaultPrisma) {
    for (const c of SYSTEM_CLASSIFICATIONS) {
      const existing = await client.vaultClassification.findFirst({
        where: { msme_id: msmeId, code: c.code },
      });

      if (!existing) {
        let parentId = null;
        if (c.parentCode) {
          const p = await client.vaultClassification.findFirst({ where: { msme_id: msmeId, code: c.parentCode } });
          if (p) parentId = p.id;
        }

        await client.vaultClassification.create({
          data: {
            msme_id: msmeId,
            name: c.name,
            code: c.code,
            description: c.description,
            parent_id: parentId,
          },
        });
      }
    }
  }

  /**
   * List Classification Taxonomy Tree
   */
  static async getTaxonomy(msmeId = 1, client = defaultPrisma) {
    await this.seedClassifications(msmeId, client);

    const items = await client.vaultClassification.findMany({
      where: { msme_id: msmeId },
      orderBy: { code: 'asc' },
    });

    return items;
  }
}

module.exports = ClassificationService;
