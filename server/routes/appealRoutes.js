const express = require('express');
const router = express.Router();
const appealController = require('../controllers/appealController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// User & Admin: List appeals (user's own if normal user, all if admin)
router.get('/', requireAuth, appealController.getAllAppeals);

// User & Admin: Get appeal details
router.get('/:id', requireAuth, appealController.getAppealById);

// Authenticated Users: Create new appeal
router.post('/', requireAuth, appealController.createAppeal);

// Admin only: Update appeal status and admin note
router.put('/:id/status', requireAuth, requireAdmin, appealController.updateAppealStatus);

module.exports = router;
