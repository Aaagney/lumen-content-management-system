const express = require('express');
const router = express.Router();
const reputationController = require('../controllers/reputationController');

// 1. Dashboard statistics
router.get('/stats', reputationController.getDashboardStats);

// 2. User list with search and filters (?search=...&trust_level=...&status=...)
router.get('/users', reputationController.getUsers);

// 3. Single user details
router.get('/users/:id', reputationController.getUserById);

// 4. Single user reputation history
router.get('/users/:id/reputation-history', reputationController.getUserHistory);

// 5. Update / record user reputation action
router.post('/users/:id/reputation', reputationController.updateReputation);

// 6. Update user account status
router.put('/users/:id/status', reputationController.updateAccountStatus);

// 7. Reset / re-seed database helper
router.post('/reset-seed', reputationController.resetDatabase);

module.exports = router;
