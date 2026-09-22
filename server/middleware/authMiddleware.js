const db = require('../config/db');

// Middleware to authenticate user via x-user-id header, query parameter, or request body
exports.requireAuth = async (req, res, next) => {
  try {
    const rawUserId = req.headers['x-user-id'] || req.query.user_id || (req.body && req.body.user_id);

    if (!rawUserId) {
      return res.status(401).json({ message: 'Authentication required. Missing user identity.' });
    }

    const userId = parseInt(rawUserId, 10);
    if (isNaN(userId)) {
      return res.status(401).json({ message: 'Invalid user identity.' });
    }

    const [users] = await db.query(
      'SELECT id, name, role, avatar, bio FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'User not found or unauthenticated.' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error during authentication.' });
  }
};

// Middleware to verify admin permissions
exports.requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
  }
  next();
};
