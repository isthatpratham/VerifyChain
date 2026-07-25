/**
 * index.js
 * Master Router for Public API v1 Platform (/api/v1).
 * Mounts telemetry, rate limiting, Swagger UI, OpenAPI spec, and REST resource routes.
 */
const express = require('express');
const router = express.Router();

const requestTracingMiddleware = require('../../middleware/requestTracing.middleware');
const apiRateLimiter = require('../../middleware/apiRateLimiter.middleware');
const dualAuthMiddleware = require('../../middleware/dualAuth.middleware');
const openapiSpec = require('./docs/openapiSpec');

const publicVerificationRoutes = require('./routes/publicVerification.routes');
const businessRoutes = require('./routes/business.routes');
const complianceRoutes = require('./routes/compliance.routes');
const supplierTrustRoutes = require('./routes/supplierTrust.routes');
const trustDistributionRoutes = require('./routes/trustDistribution.routes');
const developerRoutes = require('./routes/developer.routes');
const webhookRoutes = require('./routes/webhook.routes');
const connectorRoutes = require('./routes/connector.routes');
const developerPlatformRoutes = require('./routes/developerPlatform.routes');
const aiPlatformRoutes = require('./routes/aiPlatform.routes');
const complianceIntelligenceRoutes = require('./routes/complianceIntelligence.routes');
const documentIntelligenceRoutes = require('./routes/documentIntelligence.routes');
const aiAssistantRoutes = require('./routes/aiAssistant.routes');
const predictiveIntelligenceRoutes = require('./routes/predictiveIntelligence.routes');
const aiGovernanceRoutes = require('./routes/aiGovernance.routes');

// Mount global API v1 infrastructure & auth middleware
router.use(requestTracingMiddleware);
router.use(apiRateLimiter());
router.use(dualAuthMiddleware());

// 1. OpenAPI Specification Endpoint (JSON)
router.get('/docs/openapi.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(openapiSpec);
});

// 2. Interactive Swagger UI HTML Interface
router.get('/docs', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>VerifyChain Enterprise API Documentation</title>
      <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui.css" />
      <style>
        html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin: 0; background: #fafafa; }
        .swagger-ui .topbar { background-color: #0f172a; }
      </style>
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui-bundle.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui-standalone-preset.js"></script>
      <script>
        window.onload = function() {
          const ui = SwaggerUIBundle({
            url: "/api/v1/docs/openapi.json",
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIStandalonePreset
            ],
            plugins: [
              SwaggerUIBundle.plugins.DownloadUrl
            ],
            layout: "StandaloneLayout"
          });
          window.ui = ui;
        };
      </script>
    </body>
    </html>
  `);
});

// 3. Resource Group Sub-routers
router.use('/verify', publicVerificationRoutes);
router.use('/businesses', businessRoutes);
router.use('/compliance', complianceRoutes);
router.use('/trust', supplierTrustRoutes);
router.use('/distribution', trustDistributionRoutes);
router.use('/developer', developerRoutes);
router.use('/developer-platform', developerPlatformRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/connectors', connectorRoutes);
router.use('/ai', aiPlatformRoutes);
router.use('/ai-compliance', complianceIntelligenceRoutes);
router.use('/document-intelligence', documentIntelligenceRoutes);
router.use('/ai-assistant', aiAssistantRoutes);
router.use('/predictive-intelligence', predictiveIntelligenceRoutes);
router.use('/ai-governance', aiGovernanceRoutes);

module.exports = router;
