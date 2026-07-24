const rulesEngineService = require('../services/rulesEngine.service');
const asyncHandler = require('../middleware/asyncHandler');

const evaluateRules = asyncHandler(async (req, res) => {
  if (!req.user.msmeId) {
    return res.status(400).json({ error: 'MSME Profile setup required before evaluating rules.' });
  }

  const result = await rulesEngineService.evaluateRules(req.user.msmeId);
  res.json({
    success: true,
    data: result,
  });
});

const explainDecision = asyncHandler(async (req, res) => {
  if (!req.user.msmeId) {
    return res.status(400).json({ error: 'MSME Profile setup required.' });
  }

  const authority = req.query.authority || null;
  const result = await rulesEngineService.explainDecision(req.user.msmeId, authority);
  res.json({
    success: true,
    data: result,
  });
});

const previewEvaluation = asyncHandler(async (req, res) => {
  const result = await rulesEngineService.previewEvaluation(req.body);
  res.json({
    success: true,
    data: result,
  });
});

const getAuditHistory = asyncHandler(async (req, res) => {
  if (!req.user.msmeId) {
    return res.status(400).json({ error: 'MSME Profile setup required.' });
  }

  const result = await rulesEngineService.getAuditHistory(req.user.msmeId, req.query);
  res.json({
    success: true,
    data: result.items,
    pagination: result.pagination,
  });
});

module.exports = {
  evaluateRules,
  explainDecision,
  previewEvaluation,
  getAuditHistory,
};
