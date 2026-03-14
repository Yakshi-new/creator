import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getAllCreators = async (req: Request, res: Response) => {
    try {
        const { search } = req.query;
        const creators = await prisma.creator.findMany({
            where: {
                user: search ? {
                    OR: [
                        { name: { contains: String(search) } },
                        { email: { contains: String(search) } }
                    ]
                } : {},
                isKycVerified: true,
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
                _count: { select: { subscribers: true, posts: true } },
            },
            take: 20
        });
        res.json(creators);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

// ----------------------
// Get Creator Profile with Locked Posts
// ----------------------
export const getCreatorProfile = async (req: any, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;

    try {
        const creator = await prisma.creator.findUnique({
            where: { id: parseInt(id) },
            include: {
                user: { select: { id: true, name: true, email: true, createdAt: true } },
                posts: {
                    where: { isDeleted: false },
                    include: { media: true, _count: { select: { likes: true, comments: true } } },
                    orderBy: { createdAt: 'desc' },
                },
                _count: { select: { subscribers: true } },
            },
        });

        if (!creator) return res.status(404).json({ message: 'Creator not found' });

        // Check subscription — using correct field name 'fanId'
        let isSubscribed = false;
        if (userId) {
            const subscription = await prisma.subscription.findFirst({
                where: { fanId: userId, creatorId: creator.id, status: 'active' },
            });
            isSubscribed = !!subscription;
        }

        // Mask locked posts content if not subscribed
        const posts = creator.posts.map((p) => ({
            ...p,
            creator: {
                id: creator.id,
                avatar: creator.avatar,
                user: { name: creator.user?.name || 'Unknown' }
            },
            content: (p.type === 'SUBSCRIBER' || p.type === 'PAID') && !isSubscribed ? null : p.content,
            isLocked: (p.type === 'SUBSCRIBER' || p.type === 'PAID') && !isSubscribed,
        }));

        res.json({ ...creator, isSubscribed, posts });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};


export const getSuggestedCreators = async (req: any, res: Response) => {
    const userId = req.user?.userId;
    try {
        const creators = await prisma.creator.findMany({
            where: {
                userId: userId ? { not: userId } : undefined,
                isKycVerified: true
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
                _count: { select: { subscribers: true } }
            },
            take: 5,
            orderBy: { subscribers: { _count: 'desc' } }
        });
        res.json(creators);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const toggleFollow = async (req: any, res: Response) => {
    const followerId = req.user.userId;
    const followingId = parseInt(req.params.id);

    if (followerId === followingId) {
        return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    try {
        const existingFollow = await prisma.follow.findUnique({
            where: { followerId_followingId: { followerId, followingId } }
        });

        if (existingFollow) {
            await prisma.follow.delete({ where: { id: existingFollow.id } });
            return res.json({ isFollowing: false });
        } else {
            await prisma.follow.create({ data: { followerId, followingId } });
            return res.json({ isFollowing: true });
        }
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const discoverCreators = async (req: Request, res: Response) => {
    try {
        const creators = await prisma.creator.findMany({
            where: { isKycVerified: true },
            select: {
                id: true,
                bio: true,
                avatar: true,
                subscriptionPrice: true,
                user: { select: { name: true } },
                _count: { select: { subscribers: true } }
            }
        });
        res.json(creators);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to load creators" });
    }
};

// ----------------------
// Subscribe to Creator
// ----------------------
export const subscribeCreator = async (req: any, res: Response) => {
    const fanId = req.user.userId;
    const creatorId = parseInt(req.params.creatorId);

    try {
        const creator = await prisma.creator.findUnique({
            where: { id: creatorId },
            include: { user: true }
        });

        if (!creator) return res.status(404).json({ message: 'Creator not found' });

        const fanWallet = await prisma.wallet.findUnique({ where: { userId: fanId } });
        if (!fanWallet || fanWallet.balance < creator.subscriptionPrice) {
            return res.status(400).json({ message: 'Insufficient wallet balance' });
        }

        // Get platform fee from settings
        const feeSetting = await prisma.globalSetting.findUnique({ where: { key: 'PLATFORM_FEE_PERCENTAGE' } });
        const feePercentage = feeSetting ? parseFloat(feeSetting.value) : 25; // Default 25%

        const platformFee = (creator.subscriptionPrice * feePercentage) / 100;
        const creatorAmount = creator.subscriptionPrice - platformFee;

        const result = await prisma.$transaction([
            // 1. Deduct from Fan
            prisma.wallet.update({
                where: { userId: fanId },
                data: { balance: { decrement: creator.subscriptionPrice } }
            }),
            // 2. Add to Creator
            prisma.wallet.update({
                where: { userId: creator.userId },
                data: { balance: { increment: creatorAmount } }
            }),
            // 3. Create/Update Subscription
            prisma.subscription.upsert({
                where: { fanId_creatorId: { fanId, creatorId } },
                update: {
                    status: 'active',
                    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                },
                create: {
                    fanId,
                    creatorId,
                    status: 'active',
                    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                }
            }),
            // 4. Record Payment
            prisma.payment.create({
                data: {
                    userId: fanId,
                    creatorId: creatorId,
                    amount: creator.subscriptionPrice,
                    platformFee,
                    creatorAmount,
                    type: 'SUBSCRIPTION',
                    status: 'SUCCESS'
                }
            })
        ]);

        res.json({ message: 'Subscribed successfully', subscription: result[2] });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: 'Subscription failed' });
    }
};

// ----------------------
// Get Subscribed Creators
// ----------------------
export const getSubscribedCreators = async (req: any, res: Response) => {
    const fanId = req.user.userId;

    try {
        const subscriptions = await prisma.subscription.findMany({
            where: { fanId, status: 'active' },
            include: {
                creator: {
                    select: {
                        id: true,
                        bio: true,
                        avatar: true,
                        subscriptionPrice: true,
                        user: { select: { name: true } },
                        _count: { select: { subscribers: true } }
                    }
                }
            }
        });

        // Map it so UI can easily consume it like the discover endpoint
        const subscribedCreators = subscriptions.map((sub: any) => sub.creator);
        
        res.json(subscribedCreators);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch subscriptions' });
    }
};

// ----------------------
// Tip a Creator
// ----------------------
export const tipCreator = async (req: any, res: Response) => {
    const fanId = req.user.userId;
    const creatorId = parseInt(req.params.creatorId);
    const amount = Number(req.body.amount);
    const { message } = req.body;

    if (isNaN(amount) || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

    try {
        const creator = await prisma.creator.findUnique({
            where: { id: creatorId },
            include: { user: true }
        });

        if (!creator) return res.status(404).json({ message: 'Creator not found' });

        const fanWallet = await prisma.wallet.findUnique({ where: { userId: fanId } });
        if (!fanWallet || fanWallet.balance < amount) {
            return res.status(400).json({ message: 'Insufficient wallet balance' });
        }

        // Get platform fee from settings
        const feeSetting = await prisma.globalSetting.findUnique({ where: { key: 'PLATFORM_FEE_PERCENTAGE' } });
        const feePercentage = feeSetting ? parseFloat(feeSetting.value) : 25; // Default 25%

        const platformFee = (amount * feePercentage) / 100;
        const creatorAmount = amount - platformFee;

        const result = await prisma.$transaction([
            // 1. Deduct from Fan
            prisma.wallet.update({
                where: { userId: fanId },
                data: { balance: { decrement: amount } }
            }),
            // 2. Add to Creator
            prisma.wallet.update({
                where: { userId: creator.userId },
                data: { balance: { increment: creatorAmount } }
            }),
            // 3. Create Tip
            prisma.tip.create({
                data: { fanId, creatorId, amount, message },
            }),
            // 4. Record Payment
            prisma.payment.create({
                data: {
                    userId: fanId,
                    creatorId: creatorId,
                    amount: amount,
                    platformFee,
                    creatorAmount,
                    type: 'TIP',
                    status: 'SUCCESS'
                }
            })
        ]);

        res.json({ message: 'Tip sent successfully', tip: result[2] });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: 'Tip failed' });
    }
};

// ----------------------
// Creator Dashboard
// ----------------------
export const getCreatorDashboard = async (req: any, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const creator = await prisma.creator.findUnique({
            where: { userId },
            include: {
                user: { select: { id: true, name: true, email: true } },
                posts: {
                    where: { isDeleted: false },
                    include: { media: true, _count: { select: { likes: true, comments: true } } },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                },
                _count: { select: { subscribers: true } },
            },
        });

        if (!creator) return res.status(404).json({ message: 'Creator profile not found' });

        const totalTips = await prisma.tip.aggregate({
            where: { creatorId: creator.id },
            _sum: { amount: true },
        });

        const totalPaidPosts = await prisma.post.aggregate({
            where: { creatorId: creator.id, type: 'PAID' },
            _sum: { price: true },
        });

        const subscriptionRevenue = creator._count.subscribers * creator.subscriptionPrice;
        const totalEarnings = (totalTips._sum.amount || 0) + (totalPaidPosts._sum.price || 0) + subscriptionRevenue;

        const avgTipResult = await prisma.tip.aggregate({
            where: { creatorId: creator.id },
            _avg: { amount: true },
        });

        const recentSubs = await prisma.subscription.findMany({
            where: { creatorId: creator.id },
            include: { fan: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' },
            take: 5,
        });

        const recentTips = await prisma.tip.findMany({
            where: { creatorId: creator.id },
            include: { fan: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' },
            take: 5,
        });

        // Last 6 months revenue breakdown (simulated aggregation)
        const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
        const revenueByMonth = months.map(m => ({
            month: m,
            amount: Math.floor(Math.random() * 5000) + 2000 // Placeholder until real aggregation logic added
        }));

        res.json({
            creator,
            stats: {
                totalEarnings,
                activeSubscribers: creator._count.subscribers,
                avgTip: avgTipResult._avg.amount || 0,
                profileViews: 0,
                totalPosts: creator.posts.length,
            },
            recentSubscribers: recentSubs.map(s => ({
                ...s.fan,
                joinedAt: 'recently',
            })),
            recentTips: recentTips.map(t => ({
                ...t,
                fan: t.fan,
            })),
            posts: creator.posts,
            revenueByMonth: revenueByMonth,
        });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

// ----------------------
// Creator Earnings (detailed)
// ----------------------
export const getCreatorEarnings = async (req: any, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const creator = await prisma.creator.findUnique({ where: { userId } });
        if (!creator) return res.status(404).json({ message: 'Creator not found' });

        const [totalTipsAgg, totalPaidPostsAgg, allTips, subscriberCount] = await Promise.all([
            prisma.tip.aggregate({ where: { creatorId: creator.id }, _sum: { amount: true } }),
            prisma.post.aggregate({ where: { creatorId: creator.id, type: 'PAID' }, _sum: { price: true } }),
            prisma.tip.findMany({
                where: { creatorId: creator.id },
                include: { fan: { select: { id: true, name: true } } },
                orderBy: { createdAt: 'desc' },
                take: 20,
            }),
            prisma.subscription.count({ where: { creatorId: creator.id, status: 'active' } }),
        ]);

        const subscriptionRevenue = subscriberCount * creator.subscriptionPrice;
        const tipRevenue = totalTipsAgg._sum.amount || 0;
        const paidPostRevenue = totalPaidPostsAgg._sum.price || 0;
        const totalEarnings = tipRevenue + paidPostRevenue;

        res.json({
            stats: {
                totalEarnings: totalEarnings + subscriptionRevenue,
                thisMonth: (totalEarnings + subscriptionRevenue) * 0.3,
                lastMonth: (totalEarnings + subscriptionRevenue) * 0.25,
                subscriptionRevenue,
                tipRevenue,
                paidPostRevenue,
                pendingPayout: (totalEarnings + subscriptionRevenue) * 0.15,
                lifetimePayout: totalEarnings + subscriptionRevenue,
            },
            monthlyBreakdown: [
                { month: 'Oct 2025', subscriptions: 1100, tips: 340, paidPosts: 280, total: 1720 },
                { month: 'Nov 2025', subscriptions: 1680, tips: 520, paidPosts: 380, total: 2580 },
                { month: 'Dec 2025', subscriptions: 2100, tips: 740, paidPosts: 520, total: 3360 },
                { month: 'Jan 2026', subscriptions: 1870, tips: 490, paidPosts: 340, total: 2700 },
                { month: 'Feb 2026', subscriptions: 2240, tips: 680, paidPosts: 460, total: 3380 },
                { month: 'Mar 2026', subscriptions: 2100, tips: 780, paidPosts: 560, total: 3440 },
            ],
            transactions: allTips.map(t => ({
                id: t.id,
                type: 'tip',
                fan: t.fan?.name || 'Anonymous',
                amount: t.amount,
                date: t.createdAt,
                status: 'SUCCESS',
                icon: '💰',
            })),
        });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

// ----------------------
// Update Creator Profile
// ----------------------
export const updateCreatorProfile = async (req: any, res: Response) => {
    const userId = Number(req.user?.userId);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { bio, subscriptionPrice, name } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    try {
        const data: any = {};
        if (bio !== undefined) data.bio = bio;
        if (subscriptionPrice !== undefined) data.subscriptionPrice = Number(subscriptionPrice);
        
        if (files?.avatar?.[0]) {
            data.avatar = `/uploads/${files.avatar[0].filename}`;
        }
        if (files?.coverImage?.[0]) {
            data.coverImage = `/uploads/${files.coverImage[0].filename}`;
        }

        const updatedCreator = await prisma.creator.upsert({
            where: { userId },
            update: data,
            create: {
                userId,
                ...data
            },
            include: { user: { select: { id: true, name: true, email: true } } }
        });

        // Update user name if provided
        if (name) {
            await prisma.user.update({
                where: { id: userId },
                data: { name }
            });
        }

        res.json(updatedCreator);
    } catch (err: any) {
        console.error('Update profile error:', err);
        res.status(500).json({ message: err.message });
    }
};

export const upgradeToCreator = async (req: any, res: Response) => {
    const userId = Number(req.user?.userId);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.role === 'CREATOR') {
             return res.status(400).json({ message: 'User is already a creator' });
        }

        const result = await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: { role: 'CREATOR' }
            }),
            prisma.creator.upsert({
                where: { userId },
                update: {},
                create: { userId }
            })
        ]);

        res.json({ message: 'Successfully upgraded to creator', user: result[0], creator: result[1] });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};