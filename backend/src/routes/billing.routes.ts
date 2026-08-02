import { Router } from 'express';
import { checkout, portal } from '../controllers/billing.controllers';
import { requireAuth } from '../middleware/requireAuth.middleware';

const router = Router();

router.post('/checkout', requireAuth, checkout);
router.post('/portal', requireAuth, portal);

export default router;
