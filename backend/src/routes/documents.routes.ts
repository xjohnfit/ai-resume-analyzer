import { Router } from 'express';
import { downloadDocument } from '../controllers/documents.controllers';
import { requireAuth } from '../middleware/requireAuth.middleware';

const router = Router();

router.get('/:id/download', requireAuth, downloadDocument);

export default router;
