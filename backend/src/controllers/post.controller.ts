import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getPosts = async (req: Request, res: Response) => {
    try {
        const { creatorId } = req.query;
        const posts = await prisma.post.findMany({
            where: creatorId ? { creatorId: String(creatorId) } : {},
            include: {
                creator: {
                    include: {
                        user: {
                            select: { name: true, email: true }
                        }
                    }
                },
                media: true,
                _count: {
                    select: { likes: true, comments: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(posts);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const createPost = async (req: any, res: Response) => {
    const { content, type, price } = req.body;
    const userId = req.user.userId;
    const files = req.files as Express.Multer.File[];

    try {
        const creator = await prisma.creator.findUnique({ where: { userId } });
        if (!creator) return res.status(403).json({ message: 'Only creators can post' });

        // Generate URLs for uploaded files
        const mediaUrls = files?.map(file => `/uploads/${file.filename}`) || [];

        const post = await prisma.post.create({
            data: {
                creatorId: creator.id,
                content: content || null,
                type: type || 'SUBSCRIBER',
                price: type === 'PAID' ? Number(price) : null,
                updatedAt: new Date(),
                media: {
                    create: mediaUrls.map((url: string) => ({
                        url,
                        type: url.match(/\.(mp4|mov|webm)$/i) ? 'video' : 'image'
                    }))
                }
            },
            include: { media: true }
        });

        res.status(201).json(post);
    } catch (err: any) {
        console.error('Create post error:', err);
        res.status(500).json({ message: err.message });
    }
};

export const getFeed = async (req: any, res: Response) => {
    const userId = req.user.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    try {
        // Find creators the user is subscribed to
        const subscriptions = await prisma.subscription.findMany({
            where: { fanId: userId, status: 'active' },
            select: { creatorId: true }
        });

        const subscribedCreatorIds = subscriptions.map(s => s.creatorId);

        // Get posts
        const posts = await prisma.post.findMany({
            where: {
                isDeleted: false,
                OR: [
                    { type: 'PUBLIC' },
                    { creatorId: { in: subscribedCreatorIds } }
                ]
            },
            skip,
            take: limit,
            include: {
                creator: {
                    include: {
                        user: {
                            select: { name: true, id: true, email: true }
                        }
                    }
                },
                media: true,
                likes: {
                    where: { userId },
                    select: { id: true }
                },
                _count: {
                    select: { likes: true, comments: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Transform posts to include isLocked flag
        const feed = posts.map(post => {
            const isSubscribed = subscribedCreatorIds.includes(post.creatorId);
            const isLocked = (post.type === 'SUBSCRIBER' && !isSubscribed) || post.type === 'PAID';

            return {
                ...post,
                isLocked,
                isLiked: post.likes.length > 0
            };
        });

        res.json(feed);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const getPostsByCategory = async (req: any, res: Response) => {
    const { category } = req.params;
    const userId = req.user?.userId;
    // For now, mapping trending to most liked posts
    try {
        let subscribedCreatorIds: string[] = [];
        if (userId) {
            const subscriptions = await prisma.subscription.findMany({
                where: { fanId: userId, status: 'active' },
                select: { creatorId: true }
            });
            subscribedCreatorIds = subscriptions.map((s: any) => s.creatorId);
        }

        const posts = await prisma.post.findMany({
            where: {
                isDeleted: false,
                OR: [
                    { type: 'PUBLIC' },
                    { creatorId: { in: subscribedCreatorIds } }
                ]
            },
            include: {
                creator: {
                    include: {
                        user: { select: { name: true, id: true, email: true } }
                    }
                },
                media: true,
                _count: { select: { likes: true, comments: true } },
                likes: userId ? {
                    where: { userId },
                    select: { id: true }
                } : undefined
            },
            orderBy: category === 'trending' ? { likes: { _count: 'desc' } } : { createdAt: 'desc' },
            take: 20
        });



        const feed = posts.map((post: any) => {
            const isSubscribed = subscribedCreatorIds.includes(post.creatorId);
            const isLocked = (post.type === 'SUBSCRIBER' && !isSubscribed) || post.type === 'PAID';

            return {
                ...post,
                isLocked,
                isLiked: post.likes ? post.likes.length > 0 : false
            };
        });

        res.json(feed);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const toggleLike = async (req: any, res: Response) => {
    const postId = req.params.id;
    const userId = req.user.userId;

    try {
        const existingLike = await prisma.like.findFirst({
            where: { userId, postId }
        });

        if (existingLike) {
            await prisma.like.delete({ where: { id: existingLike.id } });
            const count = await prisma.like.count({ where: { postId } });
            return res.json({ isLiked: false, likeCount: count });
        } else {
            await prisma.like.create({ data: { userId, postId } });
            const count = await prisma.like.count({ where: { postId } });
            return res.json({ isLiked: true, likeCount: count });
        }
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const getCreatorPosts = async (req: any, res: Response) => {
    const userId = req.user.userId;

    try {
        const creator = await prisma.creator.findUnique({
            where: { userId }
        });

        if (!creator) {
            return res.status(403).json({ message: 'Creator not found' });
        }

        const posts = await prisma.post.findMany({
            where: {
                creatorId: creator.id,
                isDeleted: false
            },
            include: {
                media: true,
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json(posts);

    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const deletePost = async (req: any, res: Response) => {

    const postId = req.params.id;
    const userId = req.user.userId;

    try {

        const creator = await prisma.creator.findUnique({
            where: { userId }
        });

        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post || post.creatorId !== creator?.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await prisma.post.update({
            where: { id: postId },
            data: {
                isDeleted: true
            }
        });

        res.json({ message: "Post deleted" });

    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const purchasePost = async (req: any, res: Response) => {
    const postId = req.params.id;
    const userId = req.user.userId;

    try {
        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post || !post.price) return res.status(400).json({ message: 'Post is not purchasable' });

        const payment = await prisma.payment.create({
            data: {
                userId,
                amount: post.price,
                type: 'PAID_POST',
                status: 'SUCCESS'
            }
        });

        res.json({ message: 'Post purchased successfully', payment });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const getPostDetail = async (req: any, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;

    try {
        const post = await prisma.post.findUnique({
            where: { id },
            include: {
                creator: {
                    include: {
                        user: {
                            select: { name: true, id: true, email: true }
                        }
                    }
                },
                media: true,
                likes: userId ? {
                    where: { userId },
                    select: { id: true }
                } : undefined,
                _count: {
                    select: { likes: true, comments: true }
                }
            }
        });

        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Check lock status
        let isSubscribed = false;
        if (userId) {
            const subscription = await prisma.subscription.findFirst({
                where: { fanId: userId, creatorId: post.creatorId, status: 'active' },
            });
            isSubscribed = !!subscription;
        }

        const isLocked = (post.type === 'SUBSCRIBER' && !isSubscribed) || post.type === 'PAID';

        const transformedPost = {
            ...post,
            isLocked,
            isLiked: userId ? (post.likes?.length ?? 0) > 0 : false
        };

        res.json(transformedPost);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const updatePost = async (req: any, res: Response) => {
    const { id } = req.params;
    const { content, type, price } = req.body;
    const userId = req.user.userId;

    try {
        const post = await prisma.post.findUnique({
            where: { id },
            include: { creator: true }
        });

        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.creator.userId !== userId) return res.status(403).json({ message: 'Unauthorized' });

        const updatedPost = await prisma.post.update({
            where: { id },
            data: {
                content: content !== undefined ? content : post.content,
                type: type !== undefined ? type : post.type,
                price: type === 'PAID' ? (price !== undefined ? Number(price) : post.price) : null,
            }
        });

        res.json(updatedPost);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const addComment = async (req: any, res: Response) => {
    const postId = req.params.id;
    const userId = req.user.userId;
    const { content } = req.body;

    if (!content) return res.status(400).json({ message: 'Comment content is required' });

    try {
        const comment = await prisma.comment.create({
            data: {
                content,
                postId,
                userId
            },
            include: {
                user: {
                    select: { name: true }
                }
            }
        });

        res.status(201).json(comment);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const getComments = async (req: any, res: Response) => {
    const postId = req.params.id;

    try {
        const comments = await prisma.comment.findMany({
            where: { postId },
            include: {
                user: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        res.json(comments);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const getPublicFeed = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    try {
        const posts = await prisma.post.findMany({
            where: {
                type: 'PUBLIC',
                published: true,
                isDeleted: false,
            },
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                creator: {
                    include: { user: { select: { id: true, name: true, email: true } } }
                },
                media: true,
                _count: { select: { likes: true, comments: true } }
            }
        });

        // Transform posts to match PostCard requirements
        const feed = posts.map(post => ({
            ...post,
            isLiked: false,
            isLocked: false, // All public posts are unlocked
        }));

        res.json(feed);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};