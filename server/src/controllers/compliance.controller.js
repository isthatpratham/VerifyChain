const complianceService = require('../services/compliance.service');
const asyncHandler = require('../middleware/asyncHandler');

const getRecords = asyncHandler(async (req, res) => {
  if (!req.user.msmeId) {
    return res.status(400).json({ error: 'MSME Profile setup required before accessing compliance records.' });
  }

  const result = await complianceService.getComplianceRecords(req.user.msmeId, req.query);
  res.json({
    success: true,
    data: result.items,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    },
  });
});

const getRecordById = asyncHandler(async (req, res) => {
  if (!req.user.msmeId) {
    return res.status(400).json({ error: 'MSME Profile setup required.' });
  }

  const record = await complianceService.getComplianceRecordById(req.user.msmeId, req.params.id);
  res.json({
    success: true,
    data: record,
  });
});

const createRecord = asyncHandler(async (req, res) => {
  if (!req.user.msmeId) {
    return res.status(400).json({ error: 'MSME Profile setup required before creating compliance records.' });
  }

  const record = await complianceService.createComplianceRecord(req.user.msmeId, req.body);
  res.status(201).json({
    success: true,
    data: record,
  });
});

const updateRecord = asyncHandler(async (req, res) => {
  if (!req.user.msmeId) {
    return res.status(400).json({ error: 'MSME Profile setup required.' });
  }

  const record = await complianceService.updateComplianceRecord(req.user.msmeId, req.params.id, req.body);
  res.json({
    success: true,
    data: record,
  });
});

const deleteRecord = asyncHandler(async (req, res) => {
  if (!req.user.msmeId) {
    return res.status(400).json({ error: 'MSME Profile setup required.' });
  }

  await complianceService.deleteComplianceRecord(req.user.msmeId, req.params.id);
  res.json({
    success: true,
    message: 'Compliance record deleted successfully.',
  });
});

module.exports = {
  getRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord,
};
