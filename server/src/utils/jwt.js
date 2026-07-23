const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is missing');
  }
  return secret;
};

const getJwtExpiry = () => {
  return process.env.JWT_EXPIRY || '7d';
};

const generateToken = (payload) => {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: getJwtExpiry(),
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, getJwtSecret());
};

const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || typeof authHeader !== 'string') {
    return null;
  }
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }
  return null;
};

module.exports = {
  generateToken,
  verifyToken,
  extractTokenFromHeader,
};
