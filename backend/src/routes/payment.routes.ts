import { Router } from 'express';
import { createOrder, verifyPayment, getUserPayments, getAdminRevenueStats } from '../controllers/payment.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/create-order', authenticate, createOrder);
router.post('/verify-payment', authenticate, verifyPayment);
router.get('/my-payments', authenticate, getUserPayments);
router.get('/stats', authenticate, isAdmin, getAdminRevenueStats);

export default router;
