import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const totalUsers = await prisma.user.count({ where: { isDeleted: false } });
        const totalCreators = await prisma.creator.count();
        const totalFans = await prisma.user.count({ where: { role: 'FAN', isDeleted: false } });
        
        const payments = await prisma.payment.findMany({
            where: { status: 'SUCCESS' }
        });

        const totalVolume = payments.reduce((sum, p) => sum + p.amount, 0);
        const totalPlatformFees = payments.reduce((sum, p) => sum + p.platformFee, 0);

        // Recent stats (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentEarnings = await prisma.payment.aggregate({
            _sum: { amount: true, platformFee: true },
            where: {
                status: 'SUCCESS',
                createdAt: { gte: thirtyDaysAgo }
            }
        });

        const recentPosts = await prisma.post.count({
            where: { createdAt: { gte: thirtyDaysAgo }, isDeleted: false }
        });

        const recentUsers = await prisma.user.count({
            where: { createdAt: { gte: thirtyDaysAgo }, isDeleted: false }
        });

        res.json({
            totalUsers,
            totalCreators,
            totalFans,
            totalVolume,
            totalPlatformFees,
            recentStats: {
                earnings: recentEarnings._sum.amount || 0,
                fees: recentEarnings._sum.platformFee || 0,
                newPosts: recentPosts,
                newUsers: recentUsers
            }
        });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const getCreators = async (req: Request, res: Response) => {
    try {
        const creators = await prisma.creator.findMany({
            where: { user: { isDeleted: false } },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        isVerified: true,
                        isActive: true,
                        createdAt: true
                    }
                }
            }
        });
        res.json(creators);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const getFans = async (req: Request, res: Response) => {
    try {
        const fans = await prisma.user.findMany({
            where: { role: 'FAN', isDeleted: false },
            select: {
                id: true,
                name: true,
                email: true,
                isActive: true,
                createdAt: true,
                wallet: {
                    select: { balance: true }
                },
                _count: {
                    select: { subscription: true }
                }
            }
        });
        res.json(fans);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const getAllTransactions = async (req: Request, res: Response) => {
    try {
        const transactions = await prisma.payment.findMany({
            include: {
                fan: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(transactions);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const verifyCreator = async (req: Request, res: Response) => {
    const { creatorId, verified } = req.body;
    try {
        const creator = await prisma.creator.update({
            where: { id: creatorId },
            data: { isKycVerified: verified }
        });
        res.json(creator);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const getPlatformSettings = async (req: Request, res: Response) => {
    try {
        let fee = await prisma.globalsetting.findUnique({
            where: { key: 'PLATFORM_FEE_PERCENTAGE' }
        });

        if (!fee) {
            fee = await prisma.globalsetting.create({
                data: { key: 'PLATFORM_FEE_PERCENTAGE', value: '25', updatedAt: new Date() }
            });
        }

        res.json(fee);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const updatePlatformSetting = async (req: Request, res: Response) => {
    const { key, value } = req.body;
    try {
        const setting = await prisma.globalsetting.upsert({
            where: { key: 'PLATFORM_FEE_PERCENTAGE' },
            update: { value: value.toString(), updatedAt: new Date() },
            create: { key: 'PLATFORM_FEE_PERCENTAGE', value: value.toString(), updatedAt: new Date() }
        });
        res.json(setting);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};
export const upgradeFanToCreator = async (req: Request, res: Response) => {
    const { userId } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const result = await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: { role: 'CREATOR' }
            }),
            prisma.creator.upsert({
                where: { userId },
                update: { updatedAt: new Date() },
                create: { userId, updatedAt: new Date() }
            })
        ]);

        res.json({ message: 'User upgraded successfully', user: result[0] });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const updateUserStatus = async (req: Request, res: Response) => {
    const { userId, isActive } = req.body;
    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { isActive }
        });
        res.json(user);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const user = await prisma.user.update({
            where: { id: String(userId) },
            data: { isDeleted: true }
        });
        res.json({ message: 'User soft-deleted successfully' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const getPosts = async (req: Request, res: Response) => {
    const { userId } = req.query;
    try {
        const posts = await prisma.post.findMany({
            where: {
                isDeleted: false,
                ...(userId ? { creator: { userId: String(userId) } } : {})
            },
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

export const updatePostStatus = async (req: Request, res: Response) => {
    const { postId, published } = req.body;
    try {
        const post = await prisma.post.update({
            where: { id: postId },
            data: { published }
        });
        res.json(post);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const deletePost = async (req: Request, res: Response) => {
    const { postId } = req.params;
    try {
        const post = await prisma.post.update({
            where: { id: String(postId) },
            data: { isDeleted: true }
        });
        res.json({ message: 'Post soft-deleted successfully' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const getCreatorDetail = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const creator = await prisma.creator.findUnique({
            where: { id: String(id) },
            include: {
                user: {
                    select: { id: true, name: true, email: true, createdAt: true, isActive: true, isVerified: true }
                },
                post: {
                    where: { isDeleted: false },
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    include: { _count: { select: { likes: true, comments: true } } }
                },
                _count: {
                    select: { subscription: true, post: true }
                }
            }
        });

        if (!creator) return res.status(404).json({ message: 'Creator not found' });

        // Calculate financial stats
        const payments = await prisma.payment.findMany({
            where: { creatorId: creator.id, status: 'SUCCESS' }
        });

        const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);
        const netEarnings = payments.reduce((sum, p) => sum + p.creatorAmount, 0);
        const feesPaid = payments.reduce((sum, p) => sum + p.platformFee, 0);

        res.json({
            ...creator,
            stats: {
                totalEarnings,
                netEarnings,
                feesPaid,
                payouts: netEarnings // Simplified for now
            }
        });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const updateCreatorProfile = async (req: Request, res: Response) => {
    const { creatorId, name, email, bio, subscriptionPrice, isActive } = req.body;
    try {
        const creator = await prisma.creator.findUnique({ where: { id: creatorId } });
        if (!creator) return res.status(404).json({ message: 'Creator not found' });

        await prisma.$transaction([
            prisma.user.update({
                where: { id: creator.userId },
                data: { name, email, isActive }
            }),
            prisma.creator.update({
                where: { id: creator.id },
                data: { bio, subscriptionPrice: parseFloat(subscriptionPrice) }
            })
        ]);

        res.json({ message: 'Creator profile updated successfully' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};
