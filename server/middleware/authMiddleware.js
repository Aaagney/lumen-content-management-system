const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET || "lumen_secret_key_12345";


// =====================================================
// AUTHENTICATE TOKEN
// =====================================================

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication token is required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired authentication token",
    });
  }
};


// =====================================================
// OPTIONAL AUTHENTICATION
// =====================================================

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    req.user = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    // Invalid/expired token on an optional-auth route:
    // treat the request as anonymous.
  }

  next();
};


// =====================================================
// VERIFY ROLE
// =====================================================

const verifyRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    next();
  };
};


// =====================================================
// REQUIRE ADMIN
// =====================================================

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required",
    });
  }

  next();
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  authenticateToken,
  optionalAuth,
  verifyRole,
  requireAdmin,
  JWT_SECRET,
};