const express = require('express');
const router = express.Router();

const subscriptionController = require('../controllers/subscriptionController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Author can only manage their own subscription
const verifyAuthorOwnership = (req, res, next) => {
  const targetAuthorId = String(req.params.authorId);
  const authenticatedUserId = String(req.user.id);

  if (req.user.role === 'admin') {
    return next();
  }

  if (req.user.role !== 'author') {
    return res.status(403).json({
      success: false,
      message: 'Only authors can manage subscriptions.',
    });
  }

  if (authenticatedUserId !== targetAuthorId) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: You can only manage your own author subscription.',
    });
  }

  next();
};

// Public: Get available subscription plans
router.get(
  '/plans',
  subscriptionController.getPlans
);

// Get current subscription
router.get(
  '/status/:authorId',
  authenticateToken,
  verifyAuthorOwnership,
  subscriptionController.getSubscriptionStatus
);

// Subscribe / switch plan
router.post(
  '/:authorId',
  authenticateToken,
  verifyAuthorOwnership,
  subscriptionController.subscribe
);

// Cancel subscription
router.delete(
  '/:authorId',
  authenticateToken,
  verifyAuthorOwnership,
  subscriptionController.cancelSubscription
);

// Subscription history
router.get(
  '/history/:authorId',
  authenticateToken,
  verifyAuthorOwnership,
  subscriptionController.getSubscriptionHistory
);

module.exports = router;