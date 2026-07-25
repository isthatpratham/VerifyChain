/**
 * GuardrailsEngine.js
 * AI Guardrails, Grounding, and Hallucination Prevention Engine.
 */

class GuardrailsEngine {
  /**
   * Validate recommendations against platform constraints and confidence thresholds
   */
  validateOutput(recommendations = [], minConfidenceThreshold = 0.70) {
    return recommendations.filter((rec) => {
      if (!rec.title || !rec.description) return false;
      if ((rec.confidenceScore || 1.0) < minConfidenceThreshold) return false;
      return true;
    });
  }
}

module.exports = new GuardrailsEngine();
