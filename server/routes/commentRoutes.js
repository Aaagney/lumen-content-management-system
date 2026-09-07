const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/article/:articleId', commentController.getArticleComments);
router.post('/', authenticateToken, commentController.createComment);

module.exports = router;
