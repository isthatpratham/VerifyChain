const { body, validationResult } = require('express-validator');

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const UDYAM_REGEX = /^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/;
const BUSINESS_TYPES = ['MANUFACTURING', 'SERVICES', 'TRADING', 'FOOD_PROCESSING', 'CONSTRUCTION', 'OTHER'];

const createProfileValidationRules = [
  body('businessName')
    .trim()
    .notEmpty()
    .withMessage('businessName is required')
    .isLength({ min: 2, max: 150 })
    .withMessage('businessName must be between 2 and 150 characters'),
  body('gstin')
    .trim()
    .notEmpty()
    .withMessage('gstin is required')
    .matches(GSTIN_REGEX)
    .withMessage('Invalid GSTIN format. Expected 15-character format (e.g., 27AABCU9603R1ZX)'),
  body('udyamNumber')
    .trim()
    .notEmpty()
    .withMessage('udyamNumber is required')
    .matches(UDYAM_REGEX)
    .withMessage('Invalid Udyam registration format. Expected UDYAM-XX-00-0000000'),
  body('businessType')
    .trim()
    .notEmpty()
    .withMessage('businessType is required')
    .isIn(BUSINESS_TYPES)
    .withMessage(`businessType must be one of: ${BUSINESS_TYPES.join(', ')}`),
  body('sector')
    .trim()
    .notEmpty()
    .withMessage('sector is required'),
  body('state')
    .trim()
    .notEmpty()
    .withMessage('state is required'),
  body('district')
    .trim()
    .notEmpty()
    .withMessage('district is required'),
  body('employeeCount')
    .notEmpty()
    .withMessage('employeeCount is required')
    .isInt({ min: 0 })
    .withMessage('employeeCount must be an integer >= 0'),
  body('annualTurnoverLakh')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('annualTurnoverLakh must be a number >= 0'),
  body('isFoodBusiness')
    .optional()
    .isBoolean()
    .withMessage('isFoodBusiness must be a boolean'),
];

const updateProfileValidationRules = [
  body('businessName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('businessName must be between 2 and 150 characters'),
  body('gstin')
    .optional()
    .trim()
    .matches(GSTIN_REGEX)
    .withMessage('Invalid GSTIN format. Expected 15-character format'),
  body('udyamNumber')
    .optional()
    .trim()
    .matches(UDYAM_REGEX)
    .withMessage('Invalid Udyam registration format'),
  body('businessType')
    .optional()
    .trim()
    .isIn(BUSINESS_TYPES)
    .withMessage(`businessType must be one of: ${BUSINESS_TYPES.join(', ')}`),
  body('sector').optional().trim().notEmpty().withMessage('sector cannot be empty'),
  body('state').optional().trim().notEmpty().withMessage('state cannot be empty'),
  body('district').optional().trim().notEmpty().withMessage('district cannot be empty'),
  body('employeeCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('employeeCount must be an integer >= 0'),
  body('annualTurnoverLakh')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('annualTurnoverLakh must be a number >= 0'),
  body('isFoodBusiness')
    .optional()
    .isBoolean()
    .withMessage('isFoodBusiness must be a boolean'),
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
  createProfileValidationRules,
  updateProfileValidationRules,
  validate,
};
