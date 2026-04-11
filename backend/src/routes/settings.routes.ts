import { Router } from 'express';
import { getSetting, updateSetting, getAllSettings } from '../controllers/settings.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Publicly readable settings (maybe some)
router.get('/:key', getSetting);

// Admin only routes
router.get('/', authenticate, authorize(['ADMIN']), getAllSettings);
router.post('/update', authenticate, authorize(['ADMIN']), updateSetting);

export default router;
