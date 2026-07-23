const { authenticate } = require('./auth.middleware');
const { authorize, adminOnly, msmeOwnerOnly } = require('./admin.middleware');
const { registerValidationRules, loginValidationRules, validate } = require('./authValidation.middleware');
const asyncHandler = require('./asyncHandler');
const errorHandler = require('./errorHandler');

module.exports = {
  authenticate,
  authorize,
  adminOnly,
  msmeOwnerOnly,
  registerValidationRules,
  loginValidationRules,
  validate,
  asyncHandler,
  errorHandler,
};
