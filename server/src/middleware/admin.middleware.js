const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated. Access denied.' });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden. You do not have permission to access this resource.' });
    }

    next();
  };
};

const adminOnly = authorize('ADMIN');
const msmeOwnerOnly = authorize('MSME_OWNER');

module.exports = {
  authorize,
  adminOnly,
  msmeOwnerOnly,
};
