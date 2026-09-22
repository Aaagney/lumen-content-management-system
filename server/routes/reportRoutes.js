const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// User & Admin: Get reports (filtered to user's reports if normal user, all if admin)
router.get('/', requireAuth, reportController.getAllReports);

// User & Admin: Get single report details
router.get('/:id', requireAuth, reportController.getReportById);

// Authenticated Users: Create new report
router.post('/', requireAuth, reportController.createReport);

// Admin only: Update report status and admin note
router.put('/:id/status', requireAuth, requireAdmin, reportController.updateReportStatus);

module.exports = router;
