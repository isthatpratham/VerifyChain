/**
 * SafetyLayer.js
 * Prompt Injection Protection, Sensitive Data Filtering, & Permission Enforcement.
 */

class SafetyLayer {
  /**
   * Sanitize prompt and enforce safety boundaries
   */
  sanitizePrompt(userQuery = '') {
    // Strip prompt injection keywords or malicious override attempts
    const sanitized = userQuery
      .replace(/ignore previous instructions/gi, '')
      .replace(/system prompt/gi, '')
      .trim();

    return sanitized || 'Explain compliance overview.';
  }
}

module.exports = new SafetyLayer();
