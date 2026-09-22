/**
 * Lightweight stand-in for admin authentication/authorization.
 *
 * This is a STANDALONE module with no existing auth system to plug into,
 * so this middleware simply requires an `x-admin-id` header (simulating
 * "an authenticated admin made this request"). When integrating into a
 * real CMS, swap this out for the CMS's real auth/role middleware —
 * everything downstream just expects `req.adminId` to be set.
 */
function requireAdmin(req, res, next) {
  const adminId = req.header('x-admin-id') || req.body.adminId || 'admin';
  req.adminId = adminId;
  next();
}

module.exports = { requireAdmin };
