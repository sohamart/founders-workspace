const jwt = require('jsonwebtoken');
const { getStore } = require('../config/localStore');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_weblets_stackadda_founders_jwt_key_2026_production';

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const store = getStore();
    const user = store.users.find(u => u.id === decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found or account removed.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ 
        success: false, 
        isSuspended: true, 
        message: 'Account Suspended: You have accumulated 2 strikes or have been administratively locked out.' 
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Forbidden: Super Admin authority required.' });
  }
  next();
};

module.exports = {
  authenticate,
  requireAdmin
};
