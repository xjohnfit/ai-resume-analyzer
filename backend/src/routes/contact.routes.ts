import { Router } from 'express';
import { submitContactMessage } from '../controllers/contact.controllers';

const router = Router();

router.post('/', submitContactMessage);

export default router;
