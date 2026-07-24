const supplierTrustService = require('../services/supplierTrust.service');
const { supplierTrustAutomationCoordinator, supplierTrustDependencyGraph } = require('../supplierTrustAutomation');
const asyncHandler = require('../middleware/asyncHandler');

const evaluateTrust = asyncHandler(async (req, res) => {
  if (!req.user.msmeId) {
    return res.status(400).json({ error: 'MSME Profile setup required.' });
  }

  const result = await supplierTrustService.evaluateTrust(req.user.msmeId);
  res.json({
    success: true,
    message: 'Supplier Trust evaluation completed deterministically.',
    data: result,
  });
});

const getVerificationDecision = asyncHandler(async (req, res) => {
  if (!req.user.msmeId) {
    return res.status(400).json({ error: 'MSME Profile setup required.' });
  }

  const result = await supplierTrustService.getVerificationDecision(req.user.msmeId);
  res.json({
    success: true,
    data: result,
  });
});

const getVerificationSnapshot = asyncHandler(async (req, res) => {
  if (!req.user.msmeId) {
    return res.status(400).json({ error: 'MSME Profile setup required.' });
  }

  const result = await supplierTrustService.getVerificationSnapshot(req.user.msmeId);
  res.json({
    success: true,
    data: result,
  });
});

const getTrustProfile = asyncHandler(async (req, res) => {
  if (!req.user.msmeId) {
    return res.status(400).json({ error: 'MSME Profile setup required.' });
  }

  const profile = await supplierTrustService.getTrustProfileByMsmeId(req.user.msmeId);
  res.json({
    success: true,
    data: profile,
  });
});

const getPublicProfile = asyncHandler(async (req, res) => {
  const profile = await supplierTrustService.getTrustProfileBySlug(req.params.slug);
  res.json({
    success: true,
    data: profile,
  });
});

const getTrustMetadata = asyncHandler(async (req, res) => {
  if (!req.user.msmeId) {
    return res.status(400).json({ error: 'MSME Profile setup required.' });
  }

  const profile = await supplierTrustService.getTrustProfileByMsmeId(req.user.msmeId);
  const metadata = await supplierTrustService.getTrustMetadata(profile.id);
  res.json({
    success: true,
    data: metadata,
  });
});

const getTrustTimeline = asyncHandler(async (req, res) => {
  if (!req.user.msmeId) {
    return res.status(400).json({ error: 'MSME Profile setup required.' });
  }

  const profile = await supplierTrustService.getTrustProfileByMsmeId(req.user.msmeId);
  const timeline = await supplierTrustService.getTrustTimeline(profile.id);
  res.json({
    success: true,
    data: timeline,
  });
});

const getTrustConfig = asyncHandler(async (req, res) => {
  const config = supplierTrustService.getTrustConfiguration();
  res.json({
    success: true,
    data: config,
  });
});

// Automation Endpoints
const triggerAutomationReevaluate = asyncHandler(async (req, res) => {
  if (!req.user.msmeId) {
    return res.status(400).json({ error: 'MSME Profile setup required.' });
  }

  const result = await supplierTrustAutomationCoordinator.triggerRecalculation(req.user.msmeId);
  res.json({
    success: true,
    message: 'Supplier Trust lifecycle automation workflow triggered.',
    data: result,
  });
});

const getAutomationDependencyGraph = asyncHandler((req, res) => {
  const overview = supplierTrustDependencyGraph.getGraphOverview();
  res.json({
    success: true,
    data: overview,
  });
});

const getAutomationMetrics = asyncHandler((req, res) => {
  const metrics = supplierTrustAutomationCoordinator.getAutomationMetrics();
  res.json({
    success: true,
    data: metrics,
  });
});

module.exports = {
  evaluateTrust,
  getVerificationDecision,
  getVerificationSnapshot,
  getTrustProfile,
  getPublicProfile,
  getTrustMetadata,
  getTrustTimeline,
  getTrustConfig,
  triggerAutomationReevaluate,
  getAutomationDependencyGraph,
  getAutomationMetrics,
};
