import { Router } from 'express';
import { chat, getChatHistory } from '../controllers/chat.controllers';
import { requireAuth } from '../middleware/requireAuth.middleware';
import { requireChatMessageAllowance } from '../middleware/requireChatMessageAllowance.middleware';

const router = Router();

router.post('/', requireAuth, requireChatMessageAllowance, chat);
router.get('/history', requireAuth, getChatHistory);

export default router;
