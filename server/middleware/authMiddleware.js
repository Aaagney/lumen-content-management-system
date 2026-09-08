const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'lumen_secret_key_12345';

// Verifies JWT token if present
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Optional fallback: allow authorId in params for testing/demo role switching
      if (req.params.authorId) {
        req.user = { id: req.params.authorId, role: 'author' };
        return next();
      }
      return res.status(401).json({
        success: false,
        message: 'Authentication token is required',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token',
    });
  }
};

// Verifies user is an author
const requireAuthor = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  // Reader role attempting author action
  if (req.user.role && req.user.role.toLowerCase() === 'reader') {
    return res.status(403).json({
      success: false,
      message: 'Author role required. Readers cannot manage author subscription tiers.',
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  requireAuthor,
  JWT_SECRET,
};
