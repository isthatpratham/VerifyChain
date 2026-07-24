/**
 * DataMapper.js
 * Bidirectional Data Transformation Engine for Integration Connectors.
 * Maps external vendor schemas (ERP, CRM, Gov) to VerifyChain domain models and vice versa.
 */

class DataMapper {
  /**
   * Map external payload to VerifyChain canonical domain model
   */
  mapToDomain(resourceType, externalPayload = {}) {
    switch (resourceType) {
      case 'business_profile':
        return {
          businessName: externalPayload.businessName || externalPayload.accountName || externalPayload.legal_name || 'Unknown Business',
          gstin: externalPayload.gstin || externalPayload.tax_id || null,
          udyamNumber: externalPayload.udyamNumber || externalPayload.udyam || null,
          state: externalPayload.state || externalPayload.region || 'Maharashtra',
          sector: externalPayload.sector || externalPayload.industry || 'Manufacturing',
          isVerified: Boolean(externalPayload.verified || externalPayload.isVerified),
        };

      case 'compliance_record':
        return {
          authority: (externalPayload.authority || externalPayload.type || 'GST').toUpperCase(),
          status: (externalPayload.status || externalPayload.filingStatus || 'COMPLIANT').toUpperCase(),
          filingReference: externalPayload.filingReference || externalPayload.ref_no || null,
          expiryDate: externalPayload.expiryDate || externalPayload.valid_until || null,
        };

      case 'supplier_trust':
        return {
          trustLevel: (externalPayload.trustLevel || externalPayload.level || 'VERIFIED').toUpperCase(),
          trustScore: parseInt(externalPayload.trustScore || externalPayload.score || 85, 10),
          isPublic: Boolean(externalPayload.isPublic !== false),
        };

      default:
        return { ...externalPayload };
    }
  }

  /**
   * Map VerifyChain domain entity to external provider schema
   */
  mapToExternal(resourceType, domainEntity = {}) {
    switch (resourceType) {
      case 'business_profile':
        return {
          external_business_name: domainEntity.business_name || domainEntity.businessName,
          tax_identifier_gstin: domainEntity.gstin,
          udyam_registration_no: domainEntity.udyam_number || domainEntity.udyamNumber,
          verification_status: domainEntity.is_profile_complete ? 'VERIFIED' : 'PENDING',
          updated_at_utc: new Date().toISOString(),
        };

      case 'supplier_trust':
        return {
          vendor_trust_level: domainEntity.trust_level || domainEntity.trustLevel,
          trust_score_snapshot: domainEntity.trust_score_snapshot || domainEntity.trustScore,
          verifychain_public_url: domainEntity.public_slug ? `https://verifychain.org/verify/${domainEntity.public_slug}` : null,
        };

      default:
        return { ...domainEntity };
    }
  }
}

module.exports = new DataMapper();
