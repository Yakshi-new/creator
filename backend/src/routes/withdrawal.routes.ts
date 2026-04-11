import { Router } from 'express';
import { 
    createWithdrawalRequest, 
    getCreatorWithdrawals, 
    adminGetWithdrawals, 
    adminUpdateWithdrawalStatus 
} from '../controllers/withdrawal.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/request', authenticate, createWithdrawalRequest);
router.get('/my-withdrawals', authenticate, getCreatorWithdrawals);

// Admin Routes
router.get('/all', authenticate, isAdmin, adminGetWithdrawals);
router.post('/update/:id', authenticate, isAdmin, adminUpdateWithdrawalStatus);

export default router;
