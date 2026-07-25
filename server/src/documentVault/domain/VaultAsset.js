/**
 * VaultAsset.js
 * Domain Entity representing a Vault Asset in Enterprise Document Vault.
 */

const crypto = require('crypto');
const { VAULT_STATUSES } = require('./VaultStatus');
const { VAULT_CATEGORIES } = require('./VaultCategory');

class VaultAsset {
  constructor({
    id = null,
    assetId = null,
    title,
    displayName,
    originalFileName,
    storageIdentifier,
    storageProvider = 'LOCAL',
    documentType = 'OTHER',
    category = VAULT_CATEGORIES.BUSINESS,
    ownerId = null,
    msmeId = null,
    complianceCategory = null,
    aiAnalysisReference = null,
    status = VAULT_STATUSES.UPLOADING,
    createdBy = 'SYSTEM',
    updatedBy = 'SYSTEM',
    archivedFlag = false,
    deletedFlag = false,
    retentionPolicy = 'STANDARD_7_YEARS',
    checksum = null,
    mimeType = 'application/octet-stream',
    fileSize = 0,
    language = 'en',
    source = 'DIRECT_UPLOAD',
    currentVersion = 'v1.0',
    metadata = {},
    createdAt = new Date(),
    updatedAt = new Date(),
  }) {
    this.id = id;
    this.assetId = assetId || `VAULT_ASSET_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    this.title = title || originalFileName || 'Untitled Asset';
    this.displayName = displayName || this.title;
    this.originalFileName = originalFileName || 'document.bin';
    this.storageIdentifier = storageIdentifier;
    this.storageProvider = storageProvider;
    this.documentType = documentType;
    this.category = category;
    this.ownerId = ownerId;
    this.msmeId = msmeId;
    this.complianceCategory = complianceCategory;
    this.aiAnalysisReference = aiAnalysisReference;
    this.status = status;
    this.createdBy = createdBy;
    this.updatedBy = updatedBy;
    this.archivedFlag = archivedFlag;
    this.deletedFlag = deletedFlag;
    this.retentionPolicy = retentionPolicy;
    this.checksum = checksum || crypto.createHash('sha256').update(this.storageIdentifier || 'empty').digest('hex');
    this.mimeType = mimeType;
    this.fileSize = fileSize;
    this.language = language;
    this.source = source;
    this.currentVersion = currentVersion || 'v1.0';
    this.metadata = metadata || {};
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  toDict() {
    return {
      id: this.id,
      assetId: this.assetId,
      title: this.title,
      displayName: this.displayName,
      originalFileName: this.originalFileName,
      storageIdentifier: this.storageIdentifier,
      storageProvider: this.storageProvider,
      documentType: this.documentType,
      category: this.category,
      ownerId: this.ownerId,
      msmeId: this.msmeId,
      complianceCategory: this.complianceCategory,
      aiAnalysisReference: this.aiAnalysisReference,
      status: this.status,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      archivedFlag: this.archivedFlag,
      deletedFlag: this.deletedFlag,
      retentionPolicy: this.retentionPolicy,
      checksum: this.checksum,
      mimeType: this.mimeType,
      fileSize: this.fileSize,
      language: this.language,
      source: this.source,
      currentVersion: this.currentVersion,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = VaultAsset;
