import { Router } from 'express';
import { 
    getDashboardStats, 
    getCreators, 
    getFans, 
    getAllTransactions, 
    verifyCreator,
    getPlatformSettings,
    updatePlatformSetting,
    upgradeFanToCreator,
    updateUserStatus,
    deleteUser,
    getPosts,
    updatePostStatus,
    deletePost,
    getCreatorDetail,
    updateCreatorProfile
} from '../controllers/admin.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

// Apply auth middleware to all admin routes
router.use(authenticate);
router.use(isAdmin);

router.get('/stats', getDashboardStats);
router.get('/creators', getCreators);
router.get('/fans', getFans);
router.get('/transactions', getAllTransactions);
router.post('/verify-creator', verifyCreator);
router.post('/upgrade-user', upgradeFanToCreator);
router.post('/user-status', updateUserStatus);
router.delete('/user/:userId', deleteUser);
router.get('/posts', getPosts);
router.post('/post-status', updatePostStatus);
router.delete('/post/:postId', deletePost);
router.get('/settings', getPlatformSettings);
router.post('/settings', updatePlatformSetting);
router.get('/creator/:id', getCreatorDetail);
router.post('/creator-update', updateCreatorProfile);

export default router;
