import { Router } from 'express';
import { getWalletBalance, addFunds } from '../controllers/wallet.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/balance', authenticate, getWalletBalance);
router.post('/add', authenticate, addFunds);

export default router;
