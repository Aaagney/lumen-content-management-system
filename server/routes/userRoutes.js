const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/:id', userController.getUserProfile);
router.get('/:id/articles', userController.getUserArticles);

module.exports = router;