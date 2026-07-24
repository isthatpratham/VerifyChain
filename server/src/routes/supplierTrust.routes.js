const express = require('express');
const router = express.Router();
const supplierTrustController = require('../controllers/supplierTrust.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Public endpoints
router.get('/public/:slug', supplierTrustController.getPublicProfile);

// Authenticated endpoints
router.use(authenticate);

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
