import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const subscribeToCreator = async (req: any, res: Response) => {
    const { creatorId } = req.body;
    const fanId = req.user.userId;

    try {
        const creator = await prisma.creator.findUnique({
            where: { id: parseInt(creatorId) }
        });

        if (!creator) return res.status(404).json({ message: 'Creator not found' });

        // Update logic: Use upsert for subscription
        const subscription = await prisma.subscription.upsert({
            where: { fanId_creatorId: { fanId, creatorId: parseInt(creatorId) } },
            update: {
                status: 'active',
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
            },
            create: {
                fanId,
                creatorId: parseInt(creatorId),
                status: 'active',
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
        });

        res.json(subscription);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const getSubscriptions = async (req: any, res: Response) => {
    const fanId = req.user.userId;

    try {
        const subs = await prisma.subscription.findMany({
            where: { fanId, status: 'active' },
            include: {
                creator: {
                    include: { user: { select: { name: true, email: true } } }
                }
            }
        });
        res.json(subs);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};
