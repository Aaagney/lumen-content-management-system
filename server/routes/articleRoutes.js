const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const adminController = require('../controllers/adminController');
const { authenticateToken, optionalAuth, verifyRole, requireAdmin } = require('../middleware/authMiddleware');

// Public reads. /user/:authorId and /:id use optionalAuth so a logged-in
// owner/admin can see unpublished articles while anonymous visitors only
// ever see Published ones (enforced in the controller).
router.get('/categories', articleController.getCategories);

router.get('/', articleController.getAllArticles);
router.get('/user/:authorId', optionalAuth, articleController.getArticlesByAuthor);
router.get('/:id', optionalAuth, articleController.getArticleById);

// Authenticated writes — ownership enforced inside the controllers via req.user
router.post('/', authenticateToken, verifyRole(['author','admin']), articleController.createArticle);
router.put('/:id', authenticateToken, verifyRole(['author','admin']), articleController.updateArticle);
router.delete('/:id', authenticateToken, verifyRole(['author','admin']), articleController.deleteArticle);


module.exports = router;
