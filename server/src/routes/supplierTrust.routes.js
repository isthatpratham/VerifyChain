const express = require('express');
const router = express.Router();
const supplierTrustController = require('../controllers/supplierTrust.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');

// Public endpoints
router.get('/public/:slug', supplierTrustController.getPublicProfile);

// Authenticated endpoints
router.use(authenticate);

// Administrative Backfill Endpoint (ADMIN only)
router.post('/backfill', adminOnly, supplierTrustController.triggerBackfill);

// Core Trust Evaluation Endpoints
router.post('/evaluate', supplierTrustController.evaluateTrust);
router.get('/decision', supplierTrustController.getVerificationDecision);
router.get('/snapshot', supplierTrustController.getVerificationSnapshot);

// Profile & Metadata Endpoints
router.get('/profile', supplierTrustController.getTrustProfile);
router.get('/metadata', supplierTrustController.getTrustMetadata);
router.get('/timeline', supplierTrustController.getTrustTimeline);
router.get('/config', supplierTrustController.getTrustConfig);

// Lifecycle Automation & Orchestration Endpoints
router.post('/automation/re-evaluate', supplierTrustController.triggerAutomationReevaluate);
router.get('/automation/dependency-graph', supplierTrustController.getAutomationDependencyGraph);
router.get('/automation/metrics', supplierTrustController.getAutomationMetrics);

module.exports = router;
