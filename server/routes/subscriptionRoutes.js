const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { authenticateToken, requireAuthor } = require('../middleware/authMiddleware');

// Public endpoint to view available subscription plans
router.get('/plans', subscriptionController.getPlans);

// Author subscription status & active plan
router.get('/status/:authorId', authenticateToken, subscriptionController.getSubscriptionStatus);

// Subscribe to a plan
router.post('/:authorId', authenticateToken, requireAuthor, subscriptionController.subscribe);

// Cancel active subscription
router.delete('/:authorId', authenticateToken, requireAuthor, subscriptionController.cancelSubscription);

// View author subscription history
router.get('/history/:authorId', authenticateToken, subscriptionController.getSubscriptionHistory);

module.exports = router;
