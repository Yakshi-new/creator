import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const createWithdrawalRequest = async (req: any, res: Response) => {
    const { amount, payoutMethod, payoutDetails } = req.body;
    const userId = req.user.userId;

    try {
        const creator = await (prisma as any).creator.findUnique({
            where: { userId },
        });

        if (!creator) return res.status(404).json({ message: 'Creator profile not found' });
        
        if (!creator.isKycVerified) {
            return res.status(403).json({ message: 'KYC verification required for withdrawals' });
        }

        const wallet = await (prisma as any).wallet.findUnique({ where: { userId } });
        if (!wallet || wallet.balance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Create request and deduct balance immediately (Locking the funds)
        const withdrawal = await (prisma as any).withdrawal.create({
            data: {
                creatorId: creator.id,
                amount,
                payoutMethod,
                payoutDetails,
                status: 'PENDING'
            }
        });

        await (prisma as any).wallet.update({
            where: { userId },
            data: { balance: { decrement: amount } }
        });

        const result = [withdrawal];

        res.json({ message: 'Withdrawal request submitted successfully', request: result[0] });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const getCreatorWithdrawals = async (req: any, res: Response) => {
    const userId = req.user.userId;

    try {
        const creator = await (prisma as any).creator.findUnique({ where: { userId } });
        if (!creator) return res.status(404).json({ message: 'Creator not found' });

        const withdrawals = await (prisma as any).withdrawal.findMany({
            where: { creatorId: creator.id },
            orderBy: { createdAt: 'desc' }
        });

        res.json(withdrawals);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const adminGetWithdrawals = async (req: Request, res: Response) => {
    try {
        const withdrawals = await (prisma as any).withdrawal.findMany({
            include: {
                creator: {
                    include: { user: { select: { name: true, email: true } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(withdrawals);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const adminUpdateWithdrawalStatus = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { status } = req.body; // APPROVED, REJECTED, COMPLETED

    try {
        const request = await (prisma as any).withdrawal.findUnique({
            where: { id },
            include: { creator: true }
        });

        if (!request) return res.status(404).json({ message: 'Request not found' });

        // If rejected, refund the money to creator wallet
        if (status === 'REJECTED' && request.status !== 'REJECTED') {
            await (prisma as any).withdrawal.update({
                where: { id },
                data: { status: status as any, processedAt: new Date() }
            });
            await (prisma as any).wallet.update({
                where: { userId: request.creator.userId },
                data: { balance: { increment: request.amount } }
            });
        } else {
            await (prisma as any).withdrawal.update({
                where: { id },
                data: { status: status as any, processedAt: new Date() }
            });
        }

        res.json({ message: 'Status updated successfully' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};
