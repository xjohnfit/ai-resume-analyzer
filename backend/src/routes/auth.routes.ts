import { Router } from 'express';
import {
    signup,
    login,
    refresh,
    logout,
    deleteAccount,
    verifyEmail,
    resendVerification,
    me,
} from '../controllers/auth.controllers';
import { requireAuth } from '../middleware/requireAuth.middleware';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', requireAuth, resendVerification);
router.get('/me', requireAuth, me);
router.delete('/me', requireAuth, deleteAccount);

export default router;
