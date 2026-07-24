const complianceOrchestratorService = require('../services/complianceOrchestrator.service');
const asyncHandler = require('../middleware/asyncHandler');

const syncCompliance = asyncHandler(async (req, res) => {
  if (!req.user.msmeId) {
    return res.status(400).json({ error: 'MSME Profile setup required before synchronization.' });
  }

  const result = await complianceOrchestratorService.synchronizeCompliance(req.user.msmeId);
  res.json({
    success: true,
    message: 'Compliance workspace synchronized successfully.',
    data: result,
  });
});

const recalculateCompliance = asyncHandler(async (req, res) => {
  if (!req.user.msmeId) {
    return res.status(400).json({ error: 'MSME Profile setup required.' });
  }

  const changedFields = req.body.changedFields || [];
  const result = await complianceOrchestratorService.handleBusinessUpdated(req.user.msmeId, changedFields);
  res.json({
    success: true,
    message: 'Selective compliance re-evaluation completed.',
    data: result,
  });
});

const getOrchestrationStatus = asyncHandler(async (req, res) => {
  if (!req.user.msmeId) {
    return res.status(400).json({ error: 'MSME Profile setup required.' });
  }

  const status = await complianceOrchestratorService.getOrchestrationStatus(req.user.msmeId);
  res.json({
    success: true,
    data: status,
  });
});

module.exports = {
  syncCompliance,
  recalculateCompliance,
  getOrchestrationStatus,
};
