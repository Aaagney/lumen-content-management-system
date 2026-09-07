const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');

// These connect your URL endpoints directly to the perfect controller logic you already wrote
router.get('/', articleController.getAllArticles);
router.get('/user/:authorId', articleController.getArticlesByAuthor);
router.get('/:id', articleController.getArticleById);
router.post('/', articleController.createArticle);
router.put('/:id', articleController.updateArticle);
router.delete('/:id', articleController.deleteArticle);

module.exports = router;