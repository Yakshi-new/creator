import { Router } from 'express';
import {
    getAllCreators,
    getCreatorProfile,
    getSuggestedCreators,
    toggleFollow,
    discoverCreators,
    subscribeCreator,
    tipCreator,
    getCreatorDashboard,
    getCreatorEarnings,
    updateCreatorProfile,
    getSubscribedCreators,
    upgradeToCreator,
} from '../controllers/creator.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// Public
router.get('/', getAllCreators);
router.get('/discover', discoverCreators);

// Authenticated
router.get('/suggestions', authenticate, getSuggestedCreators);
router.get('/dashboard', authenticate, authorize(['CREATOR']), getCreatorDashboard);
router.get('/earnings', authenticate, authorize(['CREATOR']), getCreatorEarnings);
router.get('/subscriptions', authenticate, getSubscribedCreators);
router.post('/upgrade', authenticate, upgradeToCreator);

router.put('/profile', authenticate, authorize(['CREATOR']), upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
]), updateCreatorProfile);

router.get('/:id', getCreatorProfile);

router.post('/follow/:id', authenticate, toggleFollow);
router.post('/:creatorId/subscribe', authenticate, subscribeCreator);
router.post('/:creatorId/tip', authenticate, tipCreator);

export default router;
