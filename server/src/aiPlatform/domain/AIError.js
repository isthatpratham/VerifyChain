/**
 * AIError.js
 * Domain Error Hierarchy for AI Platform Operations.
 */

class AIError extends Error {
  constructor(message, errorCode = 'AI_PLATFORM_ERROR', statusCode = 500, details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.errorCode = errorCode;
    this.statusCode = statusCode;
    this.details = details;
  }
}

class ProviderError extends AIError {
  constructor(message, providerCode, details = {}) {
    super(message, 'AI_PROVIDER_ERROR', 502, { providerCode, ...details });
  }
}

class RateLimitError extends AIError {
  constructor(message, providerCode, details = {}) {
    super(message, 'AI_RATE_LIMIT_EXCEEDED', 429, { providerCode, ...details });
  }
}

class ParsingError extends AIError {
  constructor(message, rawContent, details = {}) {
    super(message, 'AI_OUTPUT_PARSING_FAILED', 422, { rawContent, ...details });
  }
}

class ContextError extends AIError {
  constructor(message, details = {}) {
    super(message, 'AI_CONTEXT_BUILD_ERROR', 400, details);
  }
}

module.exports = {
  AIError,
  ProviderError,
  RateLimitError,
  ParsingError,
  ContextError,
};
