import { Router } from 'express';
import { 
    submitKyc, 
    getKycStatus, 
    adminGetKycSubmissions, 
    adminProcessKyc 
} from '../controllers/kyc.controller';
import { authenticate, isAdmin, authorize } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.get('/status', authenticate, getKycStatus);
router.post('/submit', authenticate, authorize(['CREATOR']), upload.single('idDocument'), submitKyc);

// Admin
router.get('/pending', authenticate, isAdmin, adminGetKycSubmissions);
router.post('/process/:id', authenticate, isAdmin, adminProcessKyc);

export default router;
