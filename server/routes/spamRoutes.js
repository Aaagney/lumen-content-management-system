const express = require('express');
const router = express.Router();
const controller = require('../controllers/spamController');
const { requireAdmin } = require('../middleware/adminAuth');

// Real integration point — call before saving a post/comment.
// Not admin-gated: this is called by the content-creation flow itself.
router.post('/analyze', controller.analyze);

// ---- Everything below is admin-only ----
router.use(requireAdmin);

// Detections
router.get('/detections', controller.listDetections);
router.get('/detections/:id', controller.getDetection);
router.post('/detections/:id/action', controller.takeAction);

// Stats
router.get('/stats', controller.stats);

// User activity + restrictions
router.get('/users/:userId/activity', controller.userActivity);
router.post('/users/:userId/restrict', controller.restrictUser);
router.post('/users/:userId/unrestrict', controller.unrestrictUser);

// Audit
router.get('/audit', controller.audit);

module.exports = router;
