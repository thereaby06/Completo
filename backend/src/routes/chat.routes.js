const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');

router.get('/', chatController.getMessages);
router.post('/', chatController.sendMessage);
router.patch('/:id', chatController.updateMessage);
router.delete('/:id', chatController.deleteMessage);

module.exports = router;
