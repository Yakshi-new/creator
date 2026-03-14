import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const totalUsers = await prisma.user.count();
        const totalCreators = await prisma.creator.count();
        const totalFans = await prisma.user.count({ where: { role: 'FAN' } });
        
        const payments = await prisma.payment.findMany({
            where: { status: 'SUCCESS' }
        });

        const totalVolume = payments.reduce((sum, p) => sum + p.amount, 0);
        const totalPlatformFees = payments.reduce((sum, p) => sum + p.platformFee, 0);

        res.json({
            totalUsers,
            totalCreators,
            totalFans,
            totalVolume,
            totalPlatformFees
        });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const getCreators = async (req: Request, res: Response) => {
    try {
        const creators = await prisma.creator.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        isVerified: true,
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
            where: { role: 'FAN' },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                wallet: {
                    select: { balance: true }
                },
                _count: {
                    select: { subscriptions: true }
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
                user: {
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
            where: { id: parseInt(creatorId) },
            data: { isKycVerified: verified }
        });
        res.json(creator);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const getPlatformSettings = async (req: Request, res: Response) => {
    try {
        let fee = await prisma.globalSetting.findUnique({
            where: { key: 'PLATFORM_FEE_PERCENTAGE' }
        });

        if (!fee) {
            fee = await prisma.globalSetting.create({
                data: { key: 'PLATFORM_FEE_PERCENTAGE', value: '25' }
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
        const setting = await prisma.globalSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });
        res.json(setting);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};
export const upgradeFanToCreator = async (req: Request, res: Response) => {
    const { userId } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const result = await prisma.$transaction([
            prisma.user.update({
                where: { id: Number(userId) },
                data: { role: 'CREATOR' }
            }),
            prisma.creator.upsert({
                where: { userId: Number(userId) },
                update: {},
                create: { userId: Number(userId) }
            })
        ]);

        res.json({ message: 'User upgraded successfully', user: result[0] });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};
