/**
 * EligibilityValidator.js
 * Validates whether an MSME business profile contains sufficient data
 * for deterministic health score calculation.
 */

class EligibilityValidator {
  validate(msmeProfile, complianceRecords, config) {
    const errors = [];

    if (!msmeProfile) {
      errors.push('MSME profile is missing or null.');
    } else {
      if (!msmeProfile.id) errors.push('MSME profile ID is required.');
      if (!msmeProfile.business_name) errors.push('Business name is required.');
    }

    if (!Array.isArray(complianceRecords)) {
      errors.push('Compliance records array is invalid.');
    }

    if (!config || !config.config_version) {
      errors.push('Active HealthScoreConfig definition is required.');
    }

    const isEligible = errors.length === 0;

    return {
      isEligible,
      errors,
      recordCount: Array.isArray(complianceRecords) ? complianceRecords.length : 0,
    };
  }
}

module.exports = new EligibilityValidator();
