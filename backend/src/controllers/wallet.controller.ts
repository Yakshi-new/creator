import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getWalletBalance = async (req: any, res: Response) => {
    const userId = req.user.userId;

    try {
        const wallet = await prisma.wallet.findUnique({
            where: { userId }
        });

        if (!wallet) {
            const newWallet = await prisma.wallet.create({
                data: { userId, balance: 0.0 }
            });
            return res.json(newWallet);
        }

        res.json(wallet);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const addFunds = async (req: any, res: Response) => {
    const { amount } = req.body;
    const userId = req.user.userId;

    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

    try {
        const wallet = await prisma.wallet.upsert({
            where: { userId },
            update: { balance: { increment: amount } },
            create: { userId, balance: amount }
        });

        await prisma.payment.create({
            data: {
                userId,
                amount,
                type: 'WALLET_DEPOSIT',
                status: 'SUCCESS'
            }
        });

        res.json(wallet);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};
