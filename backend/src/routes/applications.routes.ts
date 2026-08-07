import { Router } from 'express';
import {
    createApplication,
    listApplications,
    getApplication,
    updateApplication,
    deleteApplication,
    analyzeApplication,
    getApplicationFeedback
} from '../controllers/applications.controllers';
import { requireAuth } from '../middleware/requireAuth.middleware';
import { requireActiveSubscription } from '../middleware/requireActiveSubscription.middleware';

const router = Router();

router.get('/', requireAuth, listApplications);
router.post('/', requireAuth, createApplication);
router.get('/:id', requireAuth, getApplication);
router.patch('/:id', requireAuth, updateApplication);
router.delete('/:id', requireAuth, deleteApplication);
router.post('/:id/analyze', requireAuth, requireActiveSubscription, analyzeApplication);
router.get('/:id/feedback', requireAuth, getApplicationFeedback);

export default router;
