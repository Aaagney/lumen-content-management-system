const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

router.use(authenticateToken, requireAdmin);

router.get('/articles/pending', adminController.getPendingArticles);
router.put('/articles/:id/status', adminController.updateArticleStatus);

module.exports = router;
