const { body, validationResult } = require('express-validator');

const verifyGstinValidationRules = [
  body('gstin')
    .trim()
    .notEmpty()
    .withMessage('gstin is required')
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .withMessage('Invalid GSTIN format. Expected 15-character format'),
];

const verifyPanValidationRules = [
  body('pan')
    .trim()
    .notEmpty()
    .withMessage('pan is required')
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .withMessage('Invalid PAN format. Expected 10-character format (e.g. ABCDE1234F)'),
];

const verifyUdyamValidationRules = [
  body('udyamNumber')
    .trim()
    .notEmpty()
    .withMessage('udyamNumber is required')
    .matches(/^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/)
    .withMessage('Invalid Udyam registration format. Expected UDYAM-XX-00-0000000'),
];

const validateVerification = (req, res, next) => {
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
  verifyGstinValidationRules,
  verifyPanValidationRules,
  verifyUdyamValidationRules,
  validateVerification,
};
