/**
 * TrustProfileValidator.js
 * Validates whether a Supplier Trust Profile and associated business data
 * are present and complete for trust evaluation.
 */

class TrustProfileValidator {
  validate(trustProfile, msmeProfile, complianceRecords, healthSnapshot) {
    const errors = [];

    if (!trustProfile) {
      errors.push('Supplier Trust Profile is missing.');
    } else {
      if (!trustProfile.msme_id) errors.push('Trust profile MSME ID is required.');
      if (!trustProfile.public_slug) errors.push('Trust profile public slug is required.');
    }

    if (!msmeProfile) {
      errors.push('MSME profile is missing.');
    } else {
      if (!msmeProfile.gstin) errors.push('GSTIN registration is required for trust evaluation.');
      if (!msmeProfile.udyam_number) errors.push('Udyam registration is required for trust evaluation.');
    }

    if (!Array.isArray(complianceRecords)) {
      errors.push('Compliance records array is invalid.');
    }

    if (!healthSnapshot) {
      errors.push('Compliance Health Score snapshot is missing.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      recordCount: Array.isArray(complianceRecords) ? complianceRecords.length : 0,
    };
  }
}

module.exports = new TrustProfileValidator();
