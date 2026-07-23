const express = require('express');
const {
  handleCreateProfile,
  handleGetProfile,
  handleUpdateProfile,
} = require('../controllers/msme.controller');
const {
  createProfileValidationRules,
  updateProfileValidationRules,
  validate,
} = require('../middleware/msmeValidation.middleware');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/profile', verifyToken, createProfileValidationRules, validate, handleCreateProfile);
router.get('/profile', verifyToken, handleGetProfile);
router.patch('/profile', verifyToken, updateProfileValidationRules, validate, handleUpdateProfile);

module.exports = router;
