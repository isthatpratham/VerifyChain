const authService = require('../services/auth.service');

const handleRegister = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const result = await authService.registerUser({ name, email, password, phone });
    return res.status(201).json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message, details: error.details });
    }
    console.error('[handleRegister]', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });
    return res.status(200).json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message, details: error.details });
    }
    console.error('[handleLogin]', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const handleGetMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await authService.getCurrentUser(userId);
    return res.status(200).json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message, details: error.details });
    }
    console.error('[handleGetMe]', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  handleRegister,
  handleLogin,
  handleGetMe,
};
