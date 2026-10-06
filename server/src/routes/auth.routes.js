const express = require('express');
const rateLimit = require('express-rate-limit');
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

// Strict rate limiter for authentication routes (login & registration)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts from this IP, please try again after 15 minutes',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

router.post('/register', authLimiter, registerValidationRules, validate, handleRegister);
router.post('/login', authLimiter, loginValidationRules, validate, handleLogin);
router.get('/me', verifyToken, handleGetMe);

module.exports = router;

