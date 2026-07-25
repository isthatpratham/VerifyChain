/**
 * VaultIndexService.js
 * Indexing Layer for Enterprise Document Vault.
 * Indexes asset title, document type, category, owner, compliance tags, dates, metadata, and AI summaries.
 */

class VaultIndexService {
  /**
   * Build indexed search payload for an asset
   */
  static buildSearchIndex(asset) {
    const keywords = [
      asset.title,
      asset.displayName,
      asset.originalFileName,
      asset.documentType,
      asset.category,
      asset.complianceCategory,
      asset.status,
      ...(asset.metadata?.ai_metadata?.summary ? [asset.metadata.ai_metadata.summary] : []),
      ...(asset.metadata?.business_metadata?.business_name ? [asset.metadata.business_metadata.business_name] : []),
      ...(asset.metadata?.business_metadata?.gstin ? [asset.metadata.business_metadata.gstin] : []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return {
      assetId: asset.assetId,
      msmeId: asset.msmeId,
      category: asset.category,
      documentType: asset.documentType,
      status: asset.status,
      keywords,
      checksum: asset.checksum,
      createdAt: asset.createdAt,
    };
  }
}

module.exports = VaultIndexService;
