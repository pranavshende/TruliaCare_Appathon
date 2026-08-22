const passport = require('passport');

const requireAuth = passport.authenticate('jwt', { session: false });

const requireRole = (roles) => {
  return [
    requireAuth,
    (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const userRole = req.user.role;
      if (roles.includes(userRole)) {
        next();
      } else {
        return res.status(403).json({ success: false, message: 'Forbidden: Insufficient privileges' });
      }
    }
  ];
};

module.exports = {
  requireAuth,
  requireRole,
};
