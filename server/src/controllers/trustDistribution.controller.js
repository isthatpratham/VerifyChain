const trustDistributionService = require('../services/trustDistribution.service');
const { trustDistributionOrchestrator, trustDistributionImpactEngine } = require('../trustDistributionAutomation');
const asyncHandler = require('../middleware/asyncHandler');

const getDistributionIdentity = asyncHandler(async (req, res) => {
  if (!req.user.msmeId) {
    return res.status(400).json({ error: 'MSME Profile setup required.' });
  }

  const identity = await trustDistributionService.getOrCreateDistributionIdentity(req.user.msmeId);
  res.json({
    success: true,
    data: identity,
  });
});

const getDistributionConfig = asyncHandler(async (req, res) => {
  if (!req.user.msmeId) {
    return res.status(400).json({ error: 'MSME Profile setup required.' });
  }

  const identity = await trustDistributionService.getOrCreateDistributionIdentity(req.user.msmeId);
  const config = await trustDistributionService.getDistributionConfiguration(identity.id);

  res.json({
    success: true,
    data: config,
  });
});

const getDistributionTimeline = asyncHandler(async (req, res) => {
  if (!req.user.msmeId) {
    return res.status(400).json({ error: 'MSME Profile setup required.' });
  }

  const identity = await trustDistributionService.getOrCreateDistributionIdentity(req.user.msmeId);
  const timeline = await trustDistributionService.getDistributionTimeline(identity.id);

  res.json({
    success: true,
    data: timeline,
  });
});

const getChannelCatalog = asyncHandler((req, res) => {
  const catalog = trustDistributionService.getDistributionChannelCatalog();
  res.json({
    success: true,
    data: catalog,
  });
});

// Dynamic QR Verification Engine Handlers
const generateQRCode = asyncHandler(async (req, res) => {
  if (!req.user.msmeId) {
    return res.status(400).json({ error: 'MSME Profile setup required.' });
  }

  const result = await trustDistributionService.generateQRCode(req.user.msmeId);
  res.json({
    success: true,
    message: 'Dynamic QR verification asset & signed token generated successfully.',
    data: result,
  });
});

const regenerateQRCode = asyncHandler(async (req, res) => {
  if (!req.user.msmeId) {
    return res.status(400).json({ error: 'MSME Profile setup required.' });
  }

  const result = await trustDistributionService.regenerateQRCode(req.user.msmeId);
  res.json({
    success: true,
    message: 'Dynamic QR verification token regenerated.',
    data: result,
  });
});

const revokeQRCode = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token string is required for revocation.' });
  }

  const result = await trustDistributionService.revokeQRCodeToken(token);
  res.json({
    success: true,
    message: 'QR code token revoked.',
    data: result,
  });
});

const resolveVerification = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const result = await trustDistributionService.resolveQRToken(token);

  if (!result.isResolved) {
    return res.status(400).json({
      success: false,
      error: 'QR Token Verification Failed',
      reason: result.reason,
    });
  }

  res.json({
    success: true,
    data: result,
  });
});

// Trust Asset Generation Handlers
const generateTrustAssets = asyncHandler(async (req, res) => {
  if (!req.user.msmeId) {
    return res.status(400).json({ error: 'MSME Profile setup required.' });
  }

  const result = await trustDistributionService.generateTrustAssets(req.user.msmeId);
  res.json({
    success: true,
    message: 'Multi-format Trust Assets generated successfully.',
    data: result,
  });
});

const downloadCertificatePDF = asyncHandler(async (req, res) => {
  if (!req.user.msmeId) {
    return res.status(400).json({ error: 'MSME Profile setup required.' });
  }

  const pdfBuffer = await trustDistributionService.generateCertificatePDF(req.user.msmeId);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="VerifyChain_Certificate_${req.user.msmeId}.pdf"`);
  res.send(pdfBuffer);
});

// Trust Experience & Distribution Channels Handlers
const getShareLinkConfig = asyncHandler(async (req, res) => {
  if (!req.user.msmeId) {
    return res.status(400).json({ error: 'MSME Profile setup required.' });
  }

  const result = await trustDistributionService.getShareLinkConfig(req.user.msmeId);
  res.json({
    success: true,
    data: result,
  });
});

const getWidgetEmbedConfig = asyncHandler(async (req, res) => {
  if (!req.user.msmeId) {
    return res.status(400).json({ error: 'MSME Profile setup required.' });
  }

  const result = await trustDistributionService.getWidgetEmbedConfig(req.user.msmeId);
  res.json({
    success: true,
    data: result,
  });
});

const getBadgeEmbedConfig = asyncHandler(async (req, res) => {
  if (!req.user.msmeId) {
    return res.status(400).json({ error: 'MSME Profile setup required.' });
  }

  const result = await trustDistributionService.getBadgeEmbedConfig(req.user.msmeId);
  res.json({
    success: true,
    data: result,
  });
});

const resolveDeepLink = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { section } = req.query;

  const result = await trustDistributionService.resolveDeepLink(slug, section || 'overview');
  res.json({
    success: true,
    data: result,
  });
});

// Trust Distribution Orchestration Handlers
const synchronizeOrchestration = asyncHandler(async (req, res) => {
  if (!req.user.msmeId) {
    return res.status(400).json({ error: 'MSME Profile setup required.' });
  }

  const result = await trustDistributionOrchestrator.synchronizeDistribution(req.user.msmeId);
  res.json({
    success: true,
    message: 'Trust distribution lifecycle synchronization triggered.',
    data: result,
  });
});

const previewImpactAnalysis = asyncHandler((req, res) => {
  const { eventType } = req.body;
  const result = trustDistributionImpactEngine.analyzeImpact(eventType || 'TrustLevelChanged', req.body);
  res.json({
    success: true,
    data: result,
  });
});

const getOrchestrationMetrics = asyncHandler((req, res) => {
  const metrics = trustDistributionOrchestrator.getMetrics();
  res.json({
    success: true,
    data: metrics,
  });
});

module.exports = {
  getDistributionIdentity,
  getDistributionConfig,
  getDistributionTimeline,
  getChannelCatalog,
  generateQRCode,
  regenerateQRCode,
  revokeQRCode,
  resolveVerification,
  generateTrustAssets,
  downloadCertificatePDF,
  getShareLinkConfig,
  getWidgetEmbedConfig,
  getBadgeEmbedConfig,
  resolveDeepLink,
  synchronizeOrchestration,
  previewImpactAnalysis,
  getOrchestrationMetrics,
};
