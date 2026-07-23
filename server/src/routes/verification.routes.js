const express = require('express');
const {
  handleVerifyGstin,
  handleVerifyPan,
  handleVerifyUdyam,
  handleGetBusinessVerificationStatus,
} = require('../controllers/verification.controller');
const {
  verifyGstinValidationRules,
  verifyPanValidationRules,
  verifyUdyamValidationRules,
  validateVerification,
} = require('../middleware/verificationValidation.middleware');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/verify/gstin', verifyToken, verifyGstinValidationRules, validateVerification, handleVerifyGstin);
router.post('/verify/pan', verifyToken, verifyPanValidationRules, validateVerification, handleVerifyPan);
router.post('/verify/udyam', verifyToken, verifyUdyamValidationRules, validateVerification, handleVerifyUdyam);
router.get('/verification/status', verifyToken, handleGetBusinessVerificationStatus);

module.exports = router;
