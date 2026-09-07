const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const adminController = require('../controllers/adminController');
const { authenticateToken, optionalAuth, requireAdmin } = require('../middleware/authMiddleware');

// Public reads. /user/:authorId and /:id use optionalAuth so a logged-in
// owner/admin can see unpublished articles while anonymous visitors only
// ever see Published ones (enforced in the controller).
router.get('/', articleController.getAllArticles);
router.get('/user/:authorId', optionalAuth, articleController.getArticlesByAuthor);
router.get('/:id', optionalAuth, articleController.getArticleById);

// Authenticated writes — ownership enforced inside the controllers via req.user
router.post('/', authenticateToken, articleController.createArticle);
router.put('/:id', authenticateToken, articleController.updateArticle);
router.delete('/:id', authenticateToken, articleController.deleteArticle);


module.exports = router;
