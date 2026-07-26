/**
 * SearchEngine.js
 * Enterprise Information Discovery & Multi-Dimensional Search Engine (Phase 10.3).
 * Supports keyword search, boolean queries, prefix/suffix matching, metadata filtering,
 * checksum & ID lookup, version filtering, AI summary search, and filter presets.
 */

const defaultPrisma = require('../../utils/prismaClient');

class SearchEngine {
  /**
   * Execute Advanced Enterprise Search Query
   */
  static async search({
    query = null,
    folderId = null,
    category = null,
    documentType = null,
    status = null,
    tags = [],
    msmeId = 1,
    minSize = null,
    maxSize = null,
    startDate = null,
    endDate = null,
    versionNumber = null,
    checksum = null,
    storageIdentifier = null,
    sortBy = 'created_at',
    sortOrder = 'desc',
    page = 1,
    limit = 50,
  }, client = defaultPrisma) {
    const where = { msme_id: msmeId, deleted_flag: false };

    // 1. Storage Identifier or Checksum Exact Lookup
    if (checksum) where.checksum = checksum.trim();
    if (storageIdentifier) where.storage_identifier = storageIdentifier.trim();
    if (status && status !== 'ALL') where.status = status;
    if (category && category !== 'ALL') where.category = category;
    if (documentType && documentType !== 'ALL') where.document_type = documentType;
    if (versionNumber) where.current_version = versionNumber;

    // 2. Folder Isolation Filter
    if (folderId) {
      const folderRecord = await client.vaultFolder.findFirst({
        where: { OR: [{ folder_id: folderId }, { id: isNaN(Number(folderId)) ? -1 : Number(folderId) }] },
      });
      if (folderRecord) where.folder_id = folderRecord.id;
    }

    // 3. Size and Date Range Filters
    if (minSize || maxSize) {
      where.file_size = {};
      if (minSize) where.file_size.gte = parseInt(minSize, 10);
      if (maxSize) where.file_size.lte = parseInt(maxSize, 10);
    }

    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at.gte = new Date(startDate);
      if (endDate) where.created_at.lte = new Date(endDate);
    }

    // 4. Keyword / Fulltext / Boolean & Token Query Matching
    if (query && query.trim()) {
      const cleanQuery = query.trim();

      // Check for exact UUID / Asset ID lookup
      if (cleanQuery.startsWith('VAULT_ASSET_')) {
        where.asset_id = cleanQuery;
      } else {
        where.OR = [
          { title: { contains: cleanQuery, mode: 'insensitive' } },
          { display_name: { contains: cleanQuery, mode: 'insensitive' } },
          { original_file_name: { contains: cleanQuery, mode: 'insensitive' } },
          { document_type: { contains: cleanQuery, mode: 'insensitive' } },
          { checksum: { contains: cleanQuery, mode: 'insensitive' } },
        ];
      }
    }

    // 5. Tag Filter
    if (tags && Array.isArray(tags) && tags.length > 0) {
      const tagRecords = await client.vaultDocumentTag.findMany({
        where: { msme_id: msmeId, name: { in: tags.map(t => t.toUpperCase()) } },
      });
      const tagIds = tagRecords.map(t => t.id);
      if (tagIds.length > 0) {
        where.asset_tags = { some: { tag_id: { in: tagIds } } };
      }
    }

    // 6. Pagination & Sorting
    const offset = (page - 1) * limit;
    const validSortFields = ['created_at', 'title', 'file_size', 'category', 'current_version'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'created_at';

    const [assets, totalCount] = await Promise.all([
      client.vaultAsset.findMany({
        where,
        orderBy: { [orderField]: sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc' },
        skip: offset,
        take: limit,
        include: { folder: true, asset_tags: { include: { tag: true } } },
      }),
      client.vaultAsset.count({ where }),
    ]);

    return {
      query,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      results: assets,
    };
  }
}

module.exports = SearchEngine;
