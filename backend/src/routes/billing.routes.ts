import { Router } from 'express';
import {
    checkout,
    portal,
    cancelSubscription,
    reactivateSubscriptionController,
    changePlan,
} from '../controllers/billing.controllers';
import { requireAuth } from '../middleware/requireAuth.middleware';

const router = Router();

router.post('/checkout', requireAuth, checkout);
router.post('/portal', requireAuth, portal);
router.post('/cancel', requireAuth, cancelSubscription);
router.post('/reactivate', requireAuth, reactivateSubscriptionController);
router.post('/change-plan', requireAuth, changePlan);

export default router;
