
// routes/chatbot.js
const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbot');

// API routes for AJAX calls
router.post('/api/message', chatbotController.sendMessage);
router.get('/api/history/:sessionId', chatbotController.getChatHistory);
router.delete('/api/history/:sessionId', chatbotController.clearChatHistory);

module.exports = router;