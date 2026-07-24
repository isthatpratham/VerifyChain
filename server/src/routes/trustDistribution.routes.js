const express = require('express');
const router = express.Router();
const trustDistributionController = require('../controllers/trustDistribution.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Public Endpoints
router.get('/qr/resolve/:token', trustDistributionController.resolveVerification);
router.get('/experience/deep-link/:slug', trustDistributionController.resolveDeepLink);

// Authenticated Endpoints
router.use(authenticate);

// Trust Distribution Orchestration Endpoints
router.post('/orchestration/synchronize', trustDistributionController.synchronizeOrchestration);
router.post('/orchestration/impact-analysis', trustDistributionController.previewImpactAnalysis);
router.get('/orchestration/metrics', trustDistributionController.getOrchestrationMetrics);

// Trust Experience Endpoints
router.get('/experience/share-link', trustDistributionController.getShareLinkConfig);
router.get('/experience/widget-config', trustDistributionController.getWidgetEmbedConfig);
router.get('/experience/badge-config', trustDistributionController.getBadgeEmbedConfig);

// Trust Asset Generation & Download Endpoints
router.post('/assets/generate', trustDistributionController.generateTrustAssets);
router.get('/assets/download/certificate', trustDistributionController.downloadCertificatePDF);

// Dynamic QR Verification Endpoints
router.post('/qr/generate', trustDistributionController.generateQRCode);
router.post('/qr/regenerate', trustDistributionController.regenerateQRCode);
router.post('/qr/revoke', trustDistributionController.revokeQRCode);

// Distribution Identity & Config Endpoints
router.get('/identity', trustDistributionController.getDistributionIdentity);
router.get('/config', trustDistributionController.getDistributionConfig);
router.get('/timeline', trustDistributionController.getDistributionTimeline);
router.get('/channels', trustDistributionController.getChannelCatalog);

module.exports = router;
