/**
 * apiResponse.js
 * Standardized Response Envelope & Error Model for Public API v1.
 * Enforces predictable JSON structure across all REST resources.
 */

/**
 * Format and send a successful REST API response
 */
function sendSuccess(res, {
  statusCode = 200,
  data = null,
  metadata = null,
  pagination = null,
  links = null,
} = {}) {
  const requestId = res.req?.requestId || res.req?.headers['x-request-id'] || `req_${Date.now()}`;
  const timestamp = new Date().toISOString();

  const responseBody = {
    success: true,
    data,
  };

  if (metadata) responseBody.metadata = metadata;
  if (pagination) responseBody.pagination = pagination;
  if (links) responseBody.links = links;

  responseBody.requestId = requestId;
  responseBody.timestamp = timestamp;

  return res.status(statusCode).json(responseBody);
}

/**
 * Format and send a standardized REST API error response
 */
function sendError(res, {
  statusCode = 400,
  errorCode = 'BAD_REQUEST',
  message = 'An unexpected error occurred.',
  details = null,
  documentationUrl = 'http://localhost:5000/api/v1/docs',
} = {}) {
  const requestId = res.req?.requestId || res.req?.headers['x-request-id'] || `req_${Date.now()}`;
  const timestamp = new Date().toISOString();

  const responseBody = {
    success: false,
    error: {
      statusCode,
      errorCode,
      message,
      details: details || undefined,
      requestId,
      timestamp,
      documentationUrl,
    },
  };

  return res.status(statusCode).json(responseBody);
}

module.exports = {
  sendSuccess,
  sendError,
};
