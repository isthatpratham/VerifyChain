const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');
const { userRepository, msmeProfileRepository } = require('../repositories');

const authenticate = async (req, res, next) => {
  const token = extractTokenFromHeader(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ error: 'Unauthenticated. Token missing or invalid Bearer format.' });
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ error: 'Invalid authentication token payload.' });
    }

    const user = await userRepository.findById(decoded.id, {
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        is_active: true,
        created_at: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'User associated with token no longer exists.' });
    }

    if (!user.is_active) {
      return res.status(401).json({ error: 'User account is inactive or disabled.' });
    }

    // Attach fresh MSME profile ID from DB to prevent client-spoofed claims
    const msmeProfile = await msmeProfileRepository.findByUserId(user.id);

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      msmeId: msmeProfile ? msmeProfile.id : null,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Authentication token has expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid authentication token.' });
  }
};

module.exports = {
  verifyToken: authenticate,
  authenticate,
};
