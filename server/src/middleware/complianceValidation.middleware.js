const { body, query, validationResult } = require('express-validator');

const AUTHORITIES = ['GST', 'EPFO', 'ESIC', 'MCA', 'UDYAM', 'FSSAI'];
const STATUSES = ['COMPLIANT', 'DUE', 'OVERDUE', 'EXEMPT', 'UNKNOWN'];
const PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const FREQUENCIES = ['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'ANNUAL', 'ONE_TIME'];
const RISK_LEVELS = ['HIGH', 'MEDIUM', 'LOW', 'NONE'];

const createComplianceValidationRules = [
  body('authority')
    .trim()
    .notEmpty()
    .withMessage('authority is required')
    .isIn(AUTHORITIES)
    .withMessage(`authority must be one of: ${AUTHORITIES.join(', ')}`),
  body('status')
    .optional()
    .trim()
    .isIn(STATUSES)
    .withMessage(`status must be one of: ${STATUSES.join(', ')}`),
  body('priority')
    .optional()
    .trim()
    .isIn(PRIORITIES)
    .withMessage(`priority must be one of: ${PRIORITIES.join(', ')}`),
  body('renewalFrequency')
    .optional()
    .trim()
    .isIn(FREQUENCIES)
    .withMessage(`renewalFrequency must be one of: ${FREQUENCIES.join(', ')}`),
  body('riskLevel')
    .optional()
    .trim()
    .isIn(RISK_LEVELS)
    .withMessage(`riskLevel must be one of: ${RISK_LEVELS.join(', ')}`),
  body('expiryDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('expiryDate must be a valid ISO8601 date string'),
  body('lastFiled')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('lastFiled must be a valid ISO8601 date string'),
  body('filingReference')
    .optional({ nullable: true })
    .isString()
    .withMessage('filingReference must be a string'),
  body('notes')
    .optional({ nullable: true })
    .isString()
    .withMessage('notes must be a string'),
];

const updateComplianceValidationRules = [
  body('status')
    .optional()
    .trim()
    .isIn(STATUSES)
    .withMessage(`status must be one of: ${STATUSES.join(', ')}`),
  body('priority')
    .optional()
    .trim()
    .isIn(PRIORITIES)
    .withMessage(`priority must be one of: ${PRIORITIES.join(', ')}`),
  body('renewalFrequency')
    .optional()
    .trim()
    .isIn(FREQUENCIES)
    .withMessage(`renewalFrequency must be one of: ${FREQUENCIES.join(', ')}`),
  body('riskLevel')
    .optional()
    .trim()
    .isIn(RISK_LEVELS)
    .withMessage(`riskLevel must be one of: ${RISK_LEVELS.join(', ')}`),
  body('expiryDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('expiryDate must be a valid ISO8601 date string'),
  body('lastFiled')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('lastFiled must be a valid ISO8601 date string'),
  body('filingReference')
    .optional({ nullable: true })
    .isString()
    .withMessage('filingReference must be a string'),
  body('notes')
    .optional({ nullable: true })
    .isString()
    .withMessage('notes must be a string'),
];

const listComplianceValidationRules = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be an integer >= 1'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be an integer between 1 and 100'),
  query('status')
    .optional()
    .isIn(STATUSES)
    .withMessage(`status filter must be one of: ${STATUSES.join(', ')}`),
  query('authority')
    .optional()
    .isIn(AUTHORITIES)
    .withMessage(`authority filter must be one of: ${AUTHORITIES.join(', ')}`),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = errors.array().map((err) => ({
    field: err.path || err.param,
    message: err.msg,
  }));

  return res.status(400).json({
    error: 'Validation failed',
    details: extractedErrors,
  });
};

module.exports = {
  createComplianceValidationRules,
  updateComplianceValidationRules,
  listComplianceValidationRules,
  validate,
};
