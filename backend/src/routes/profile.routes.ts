import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/profile.controllers';
import { requireAuth } from '../middleware/requireAuth.middleware';

const router = Router();

router.get('/', requireAuth, getProfile);
router.put('/', requireAuth, updateProfile);

export default router;
