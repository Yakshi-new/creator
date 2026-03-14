import { Router } from 'express';
import { getConversations, getMessages, sendMessage } from '../controllers/message.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/conversations', authenticate, getConversations);
router.get('/:otherUserId', authenticate, getMessages);
router.post('/', authenticate, sendMessage);

export default router;
