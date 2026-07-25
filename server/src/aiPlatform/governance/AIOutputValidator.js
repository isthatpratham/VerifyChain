/**
 * AIOutputValidator.js
 * Multi-Stage Output Validation Pipeline.
 * Performs schema validation, required field enforcement, confidence validation, and sensitive content filtering.
 */

class AIOutputValidator {
  /**
   * Validate AI output payload before returning to caller
   */
  validateOutput({ payload = {}, requiredFields = [], minConfidence = 0.85 }) {
    const issues = [];

    // 1. Schema check
    if (!payload || typeof payload !== 'object') {
      return { isValid: false, issues: ['Payload is null or not an object.'], sanitizedPayload: null };
    }

    // 2. Required fields check
    for (const field of requiredFields) {
      if (payload[field] === undefined || payload[field] === null) {
        issues.push(`Missing required field: ${field}`);
      }
    }

    // 3. Confidence score check
    if (payload.confidenceScore !== undefined && payload.confidenceScore < minConfidence) {
      issues.push(`Output confidence (${payload.confidenceScore}) below required threshold (${minConfidence}).`);
    }

    // 4. Sensitive content check
    const jsonStr = JSON.stringify(payload).toLowerCase();
    if (jsonStr.includes('internal_secret') || jsonStr.includes('api_key_raw')) {
      issues.push('Sensitive credential or raw key detected in output.');
    }

    return {
      isValid: issues.length === 0,
      issues,
      sanitizedPayload: issues.length === 0 ? payload : null,
    };
  }
}

module.exports = new AIOutputValidator();
