const jwt = require('jsonwebtoken');
const storage = require('../services/storage');

const JWT_SECRET = process.env.JWT_SECRET || 'neuroshield_super_secret_jwt_key_2026';

const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      if (token && token !== 'null' && token !== 'undefined') {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = storage.findUserById(decoded.id);
        if (user) {
          req.user = user;
        } else {
          req.user = { id: decoded.id, email: decoded.email, role: decoded.role || 'Security Analyst' };
        }
        return next();
      }
    } catch (error) {
      console.warn('Invalid JWT token provided, proceeding as Guest Analyst:', error.message);
    }
  }

  // Allow Guest Analyst access seamlessly so users can analyze files without mandatory login
  req.user = { id: 'guest-analyst', email: 'guest@neuroshield.local', role: 'Guest Analyst' };
  return next();
};

module.exports = { protect, JWT_SECRET };
