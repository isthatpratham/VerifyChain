/**
 * VaultMetadataService.js
 * Extensible Metadata System for Enterprise Document Vault.
 * Manages file, business, compliance, AI, storage, security, processing, and custom metadata payloads.
 */

class VaultMetadataService {
  /**
   * Build complete standardized metadata structure
   */
  static buildMetadata({
    fileMetadata = {},
    businessMetadata = {},
    complianceMetadata = {},
    aiMetadata = {},
    storageMetadata = {},
    securityMetadata = {},
    processingMetadata = {},
    validationMetadata = {},
    customMetadata = {},
  } = {}) {
    return {
      file_metadata: {
        extension: fileMetadata.extension || null,
        encoding: fileMetadata.encoding || 'utf-8',
        pages_count: fileMetadata.pagesCount || 1,
        ...fileMetadata,
      },
      business_metadata: {
        business_name: businessMetadata.businessName || null,
        gstin: businessMetadata.gstin || null,
        udyam_number: businessMetadata.udyamNumber || null,
        sector: businessMetadata.sector || null,
        ...businessMetadata,
      },
      compliance_metadata: {
        authority: complianceMetadata.authority || null,
        validity_period: complianceMetadata.validityPeriod || null,
        expiry_date: complianceMetadata.expiryDate || null,
        registration_number: complianceMetadata.registrationNumber || null,
        ...complianceMetadata,
      },
      ai_metadata: {
        analysis_id: aiMetadata.analysisId || null,
        confidence_score: aiMetadata.confidenceScore || null,
        summary: aiMetadata.summary || null,
        extracted_fields_count: aiMetadata.extractedFieldsCount || 0,
        ...aiMetadata,
      },
      storage_metadata: {
        checksum: storageMetadata.checksum || null,
        encryption_algorithm: storageMetadata.encryptionAlgorithm || 'AES-256',
        storage_key: storageMetadata.storageKey || null,
        ...storageMetadata,
      },
      security_metadata: {
        virus_scan_status: securityMetadata.virusScanStatus || 'CLEAN',
        access_level: securityMetadata.accessLevel || 'CONFIDENTIAL',
        ...securityMetadata,
      },
      processing_metadata: {
        pipeline_version: processingMetadata.pipelineVersion || 'v1.0.0',
        processed_at: new Date().toISOString(),
        ...processingMetadata,
      },
      validation_metadata: {
        is_valid: validationMetadata.isValid !== undefined ? validationMetadata.isValid : true,
        validation_errors: validationMetadata.validationErrors || [],
        ...validationMetadata,
      },
      custom_metadata: customMetadata || {},
    };
  }

  /**
   * Merge new metadata fields into existing metadata
   */
  static mergeMetadata(existingMetadata = {}, newFields = {}) {
    const current = existingMetadata || {};
    return {
      ...current,
      file_metadata: { ...(current.file_metadata || {}), ...(newFields.file_metadata || {}) },
      business_metadata: { ...(current.business_metadata || {}), ...(newFields.business_metadata || {}) },
      compliance_metadata: { ...(current.compliance_metadata || {}), ...(newFields.compliance_metadata || {}) },
      ai_metadata: { ...(current.ai_metadata || {}), ...(newFields.ai_metadata || {}) },
      storage_metadata: { ...(current.storage_metadata || {}), ...(newFields.storage_metadata || {}) },
      security_metadata: { ...(current.security_metadata || {}), ...(newFields.security_metadata || {}) },
      processing_metadata: { ...(current.processing_metadata || {}), ...(newFields.processing_metadata || {}) },
      validation_metadata: { ...(current.validation_metadata || {}), ...(newFields.validation_metadata || {}) },
      custom_metadata: { ...(current.custom_metadata || {}), ...(newFields.custom_metadata || {}) },
    };
  }
}

module.exports = VaultMetadataService;
