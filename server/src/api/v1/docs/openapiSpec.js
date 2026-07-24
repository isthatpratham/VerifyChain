/**
 * openapiSpec.js
 * OpenAPI v3.0.3 Complete Specification for VerifyChain Enterprise Public API Platform & Developer Platform (/api/v1).
 */

const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'VerifyChain Enterprise Public REST API & Developer Platform',
    version: '1.0.0',
    description: 'Enterprise REST API Platform & Developer Workspace for VerifyChain MSME Compliance, Health Intelligence, Supplier Trust Verification, Trust Distribution, Webhooks Platform, Connectors, and Developer Management.',
    contact: {
      name: 'VerifyChain Developer Support',
      url: 'https://verifychain.org/docs',
      email: 'api-support@verifychain.org',
    },
    license: {
      name: 'Proprietary Enterprise License',
      url: 'https://verifychain.org/terms',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Local Development Server (v1)',
    },
    {
      url: 'https://api.verifychain.org/v1',
      description: 'Production Enterprise Cluster (v1)',
    },
  ],
  tags: [
    { name: 'Public Verification', description: 'Unauthenticated & Public Enterprise Trust Verification Portal' },
    { name: 'Business Profiles', description: 'Enterprise MSME Profile Management & Search' },
    { name: 'Statutory Compliance', description: 'Compliance Records & Health Intelligence Engine' },
    { name: 'Supplier Trust', description: 'Supplier Trust Levels, Verifications & Timelines' },
    { name: 'Trust Distribution', description: 'Trust Distribution Assets, Badges & QR Metadata' },
    { name: 'Developer Platform', description: 'API Key Management, Scopes, & Application Registration' },
    { name: 'Webhooks & Subscriptions', description: 'Real-time Event Notifications, HMAC-SHA256 Signing, & Delivery Replay' },
    { name: 'Connectors & Adapters', description: 'Enterprise ERP/CRM/Government Integration Adapter Framework & Sync Engine' },
    { name: 'Developer Workspace', description: 'Enterprise Developer Workspace, Analytics, Audit Center, Security Center, Observability, & Global Search' },
  ],
  paths: {
    '/verify/{slug}': {
      get: {
        tags: ['Public Verification'],
        summary: 'Resolve Public Enterprise Trust Profile',
        operationId: 'getPublicTrustProfile',
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Public Trust Profile resolved successfully' } },
      },
    },
    '/developer-platform/dashboard': {
      get: {
        tags: ['Developer Workspace'],
        summary: 'Get Developer Dashboard Overview',
        description: 'Aggregates applications count, active API keys, webhook status, connector health, security alerts, and request metrics.',
        operationId: 'getDeveloperDashboard',
        security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
        responses: { '200': { description: 'Dashboard overview metrics retrieved successfully' } },
      },
    },
    '/developer-platform/analytics': {
      get: {
        tags: ['Developer Workspace'],
        summary: 'Get Visual API Usage Analytics',
        operationId: 'getUsageAnalytics',
        security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
        parameters: [{ name: 'days', in: 'query', schema: { type: 'integer', default: 7 } }],
        responses: { '200': { description: 'Visual analytics dataset generated successfully' } },
      },
    },
    '/developer-platform/audit': {
      get: {
        tags: ['Developer Workspace'],
        summary: 'Search & Filter Developer Audit Logs',
        operationId: 'searchAuditLogs',
        security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'action', in: 'query', schema: { type: 'string' } },
          { name: 'resourceType', in: 'query', schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'Audit logs retrieved' } },
      },
    },
    '/developer-platform/security': {
      get: {
        tags: ['Developer Workspace'],
        summary: 'Get Developer Security Center Report',
        operationId: 'getSecurityReport',
        security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
        responses: { '200': { description: 'Security report and recommendations retrieved' } },
      },
    },
    '/developer-platform/observability': {
      get: {
        tags: ['Developer Workspace'],
        summary: 'Get System Health & Observability Metrics',
        operationId: 'getObservability',
        security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
        responses: { '200': { description: 'Observability status retrieved' } },
      },
    },
    '/developer-platform/search': {
      get: {
        tags: ['Developer Workspace'],
        summary: 'Universal Global Search Engine Overlay',
        operationId: 'universalSearch',
        security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
        parameters: [{ name: 'q', in: 'query', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Search results across apps, keys, webhooks, connectors, and audit logs' } },
      },
    },
  },
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
        description: 'High-entropy API key (vc_live_... or vc_test_...)',
      },
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'API Key',
      },
    },
  },
};

module.exports = openapiSpec;
