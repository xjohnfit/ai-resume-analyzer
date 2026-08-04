import { Router } from 'express';
import { getProfile, updateProfile, parseResume, getPhotoUploadSignature } from '../controllers/profile.controllers';
import { requireAuth } from '../middleware/requireAuth.middleware';

const router = Router();

router.get('/', requireAuth, getProfile);
router.put('/', requireAuth, updateProfile);
router.post('/parse-resume', requireAuth, parseResume);
router.get('/photo-upload-signature', requireAuth, getPhotoUploadSignature);

export default router;
