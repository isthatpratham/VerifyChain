const healthIntelligenceService = require('../services/healthIntelligence.service');
const healthAutomationCoordinator = require('../automation/HealthAutomationCoordinator');
const complianceDependencyGraph = require('../automation/ComplianceDependencyGraph');
const asyncHandler = require('../middleware/asyncHandler');

const calculateScore = asyncHandler(async (req, res) => {
  if (!req.user.msmeId) {
    return res.status(400).json({ error: 'MSME Profile setup required before score calculation.' });
  }

  const result = await healthIntelligenceService.calculateScore(req.user.msmeId);
  res.json({
    success: true,
    message: 'Compliance Health Score calculated deterministically.',
    data: result,
  });
});

const getCurrentScore = asyncHandler(async (req, res) => {
  if (!req.user.msmeId) {
    return res.status(400).json({ error: 'MSME Profile setup required.' });
  }

  const result = await healthIntelligenceService.getCurrentScore(req.user.msmeId);
  res.json({
    success: true,
    data: result,
  });
});

const getCategoryBreakdown = asyncHandler(async (req, res) => {
  if (!req.user.msmeId) {
    return res.status(400).json({ error: 'MSME Profile setup required.' });
  }

  const result = await healthIntelligenceService.getCategoryBreakdown(req.user.msmeId);
  res.json({
    success: true,
    data: result,
  });
});

const getFullIntelligence = asyncHandler(async (req, res) => {
  if (!req.user.msmeId) {
    return res.status(400).json({ error: 'MSME Profile setup required.' });
  }

  const result = await healthIntelligenceService.getFullIntelligence(req.user.msmeId);
  res.json({
    success: true,
    data: result,
  });
});

const getRiskAnalysis = asyncHandler(async (req, res) => {
  if (!req.user.msmeId) {
    return res.status(400).json({ error: 'MSME Profile setup required.' });
  }

  const result = await healthIntelligenceService.getRiskAnalysis(req.user.msmeId);
  res.json({
    success: true,
    data: result,
  });
});

const getStrengthsWeaknesses = asyncHandler(async (req, res) => {
  if (!req.user.msmeId) {
    return res.status(400).json({ error: 'MSME Profile setup required.' });
  }

  const result = await healthIntelligenceService.getStrengthsWeaknesses(req.user.msmeId);
  res.json({
    success: true,
    data: result,
  });
});

const getRecommendations = asyncHandler(async (req, res) => {
  if (!req.user.msmeId) {
    return res.status(400).json({ error: 'MSME Profile setup required.' });
  }

  const result = await healthIntelligenceService.getRecommendations(req.user.msmeId);
  res.json({
    success: true,
    data: result,
  });
});

const getExecutiveSummary = asyncHandler(async (req, res) => {
  if (!req.user.msmeId) {
    return res.status(400).json({ error: 'MSME Profile setup required.' });
  }

  const result = await healthIntelligenceService.getExecutiveSummary(req.user.msmeId);
  res.json({
    success: true,
    data: result,
  });
});

const getConfig = asyncHandler(async (req, res) => {
  const config = await healthIntelligenceService.getActiveConfig();
  res.json({
    success: true,
    data: config,
  });
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await healthIntelligenceService.getCategories();
  res.json({
    success: true,
    data: categories,
  });
});

const getSnapshots = asyncHandler(async (req, res) => {
  if (!req.user.msmeId) {
    return res.status(400).json({ error: 'MSME Profile setup required.' });
  }

  const snapshots = await healthIntelligenceService.getSnapshots(req.user.msmeId, req.query);
  res.json({
    success: true,
    data: snapshots.items,
    pagination: snapshots.pagination,
  });
});

const getMetadata = asyncHandler(async (req, res) => {
  const metadata = await healthIntelligenceService.getHealthMetadata();
  res.json({
    success: true,
    data: metadata,
  });
});

// ─── AUTOMATION & ORCHESTRATION ENDPOINTS ─────────────────────────

const triggerAutomationRecalculation = asyncHandler(async (req, res) => {
  if (!req.user.msmeId) {
    return res.status(400).json({ error: 'MSME Profile setup required.' });
  }

  const result = await healthAutomationCoordinator.triggerRecalculation(req.user.msmeId, req.body);
  res.json({
    success: true,
    message: 'Automation pipeline execution triggered successfully.',
    data: result,
  });
});

const getDependencyGraph = asyncHandler(async (req, res) => {
  const graph = complianceDependencyGraph.getGraphOverview();
  res.json({
    success: true,
    data: graph,
  });
});

const getAutomationMetrics = asyncHandler(async (req, res) => {
  const metrics = healthAutomationCoordinator.getAutomationMetrics();
  res.json({
    success: true,
    data: metrics,
  });
});

module.exports = {
  calculateScore,
  getCurrentScore,
  getCategoryBreakdown,
  getFullIntelligence,
  getRiskAnalysis,
  getStrengthsWeaknesses,
  getRecommendations,
  getExecutiveSummary,
  getConfig,
  getCategories,
  getSnapshots,
  getMetadata,
  triggerAutomationRecalculation,
  getDependencyGraph,
  getAutomationMetrics,
};
