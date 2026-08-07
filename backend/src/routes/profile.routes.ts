import { Router } from 'express';
import {
    getProfile,
    updateProfile,
    parseResume,
    getPhotoUploadSignature,
    updateProfilePhoto,
    previewProfilePdf,
} from '../controllers/profile.controllers';
import { requireAuth } from '../middleware/requireAuth.middleware';

const router = Router();

router.get('/', requireAuth, getProfile);
router.put('/', requireAuth, updateProfile);
router.post('/parse-resume', requireAuth, parseResume);
router.get('/photo-upload-signature', requireAuth, getPhotoUploadSignature);
router.patch('/photo', requireAuth, updateProfilePhoto);
router.post('/preview-pdf', requireAuth, previewProfilePdf);


export default router;
