import { Router } from 'express';
import {
    signup,
    login,
    refresh,
    logout,
    deleteAccount,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    startPhoneVerification,
    confirmPhoneVerification,
    enableMfa,
    disableMfa,
    verifyMfaLogin,
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
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/mfa/phone/start', requireAuth, startPhoneVerification);
router.post('/mfa/phone/confirm', requireAuth, confirmPhoneVerification);
router.post('/mfa/enable', requireAuth, enableMfa);
router.post('/mfa/disable', requireAuth, disableMfa);
router.post('/mfa/verify-login', verifyMfaLogin);
router.get('/me', requireAuth, me);
router.delete('/me', requireAuth, deleteAccount);

export default router;
