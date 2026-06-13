const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const {
  getOrCreateConversation,
  getConversations,
  getConversationMessages,
  sendMessage,
  getUnreadCount
} = require('../controllers/messageController');

const router = Router();

router.get('/unread/count', authenticate, getUnreadCount);
router.post('/', authenticate, getOrCreateConversation);
router.get('/', authenticate, getConversations);
router.get('/:id/messages', authenticate, getConversationMessages);
router.post('/:id/messages', authenticate, sendMessage);

module.exports = router;
