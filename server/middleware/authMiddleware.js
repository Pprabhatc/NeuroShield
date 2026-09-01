const jwt = require('jsonwebtoken');
const storage = require('../services/storage');

const JWT_SECRET = process.env.JWT_SECRET || 'neuroshield_super_secret_jwt_key_2026';

const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      const user = storage.findUserById(decoded.id);
      if (user) {
        req.user = user;
      } else {
        req.user = { id: decoded.id, email: decoded.email, role: decoded.role || 'Security Analyst' };
      }
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Unauthorized access. Token invalid or expired.' });
    }
  }

  return res.status(401).json({ success: false, message: 'Please sign in to run an intrusion scan.' });
};

module.exports = { protect, JWT_SECRET };
