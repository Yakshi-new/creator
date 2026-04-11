import { Router } from 'express';
import {
    getPosts,
    createPost,
    getFeed,
    getPostsByCategory,
    toggleLike,
    getCreatorPosts,
    deletePost,
    purchasePost,
    getPostDetail,
    updatePost,
    addComment,
    getComments,
    getPublicFeed
} from '../controllers/post.controller';

import { authenticate, authorize } from '../middleware/auth.middleware';

import { upload } from '../middleware/upload.middleware';

const router = Router();

router.get('/', getPosts);
router.get('/feed/public', getPublicFeed);
router.get('/feed', authenticate, getFeed);
router.get('/category/:category', authenticate, getPostsByCategory);

router.get('/creator', authenticate, authorize(['CREATOR']), getCreatorPosts);

router.post('/', authenticate, authorize(['CREATOR']), upload.array('media', 10), createPost);

router.patch('/:id/delete', authenticate, authorize(['CREATOR']), deletePost);

router.post('/:id/like', authenticate, toggleLike);
router.post('/:id/purchase', authenticate, purchasePost);
router.post('/:id/comment', authenticate, addComment);
router.get('/:id/comments', authenticate, getComments);

router.get('/:id', authenticate, getPostDetail);
router.put('/:id', authenticate, authorize(['CREATOR']), updatePost);


export default router;