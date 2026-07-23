const express = require('express');
const {
  handleRegister,
  handleLogin,
  handleGetMe,
} = require('../controllers/auth.controller');
const {
  registerValidationRules,
  loginValidationRules,
  validate,
} = require('../middleware/authValidation.middleware');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register', registerValidationRules, validate, handleRegister);
router.post('/login', loginValidationRules, validate, handleLogin);
router.get('/me', verifyToken, handleGetMe);

module.exports = router;
