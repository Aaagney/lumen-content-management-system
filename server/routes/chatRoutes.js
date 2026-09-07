const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Define API Endpoints
router.get('/users', chatController.getUsers);
router.get('/conversations/:userId', chatController.getConversations);
router.post('/conversations', chatController.createConversation);
router.get('/messages/:conversationId', chatController.getMessages);
router.post('/messages', chatController.sendMessage);
router.patch('/messages/read', chatController.markMessagesRead);

module.exports = router;