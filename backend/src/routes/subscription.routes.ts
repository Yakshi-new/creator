import { Router } from 'express';
import { subscribeToCreator, getSubscriptions } from '../controllers/subscription.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, subscribeToCreator);
router.get('/', authenticate, getSubscriptions);

export default router;
