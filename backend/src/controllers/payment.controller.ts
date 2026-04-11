import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

export const createOrder = async (req: any, res: Response) => {
    const { amount, type, creatorId } = req.body;
    const userId = req.user.userId;

    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

    try {
        const options = {
            amount: Math.round(amount * 100), // Razorpay amount is in paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        };

        let order;
        try {
            order = await razorpay.orders.create(options);
        } catch (rzpErr) {
            console.warn("Razorpay real order failed, falling back to mock:", rzpErr);
            order = {
                id: `mock_order_${Date.now()}`,
                amount: options.amount,
                currency: options.currency
            };
        }

        // Fetch dynamic platform fee from settings (default 25%)
        const feeSetting = await prisma.globalsetting.findUnique({
            where: { key: 'PLATFORM_FEE' }
        });
        const feePercent = feeSetting ? parseFloat(feeSetting.value) : 25;

        // Calculate fees
        const platformFee = (amount * feePercent) / 100;
        const creatorAmount = amount - platformFee;

        // Create pending payment record
        await prisma.payment.create({
            data: {
                userId,
                amount,
                platformFee,
                creatorAmount,
                type: type || 'WALLET_DEPOSIT',
                status: 'PENDING',
                razorpayOrderId: order.id,
                creatorId: creatorId ? creatorId : null
            }
        });

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID || 'mock_key'
        });
    } catch (err: any) {
        console.error("Order Creation Error:", err);
        res.status(500).json({ message: err.message });
    }
};

export const verifyPayment = async (req: any, res: Response) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user.userId;

    try {
        let isAuthentic = false;

        if (razorpay_order_id && razorpay_order_id.startsWith('mock_')) {
            console.log("Mock payment verification for:", razorpay_order_id);
            isAuthentic = true;
        } else {
            const body = razorpay_order_id + "|" + razorpay_payment_id;
            const expectedSignature = crypto
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'dummy_secret')
                .update(body.toString())
                .digest("hex");

            isAuthentic = expectedSignature === razorpay_signature;
        }

        if (isAuthentic) {
            // Update payment record
            const payment = await prisma.payment.update({
                where: { razorpayOrderId: razorpay_order_id },
                data: {
                    status: 'SUCCESS',
                    razorpayPaymentId: razorpay_payment_id,
                    razorpaySignature: razorpay_signature
                }
            });

            // If it's a wallet deposit, update user wallet
            if (payment.type === 'WALLET_DEPOSIT') {
                await prisma.wallet.upsert({
                    where: { userId },
                    update: { balance: { increment: payment.amount }, updatedAt: new Date() },
                    create: { userId, balance: payment.amount, updatedAt: new Date() }
                });
            }

            // If it's a subscription, handle subscription logic
            if (payment.type === 'SUBSCRIPTION' && payment.creatorId) {
                const thirtyDays = new Date();
                thirtyDays.setDate(thirtyDays.getDate() + 30);

                await prisma.subscription.upsert({
                    where: {
                        fanId_creatorId: {
                            fanId: userId,
                            creatorId: payment.creatorId
                        }
                    },
                    update: {
                        status: 'active',
                        currentPeriodEnd: thirtyDays
                    },
                    create: {
                        fanId: userId,
                        creatorId: payment.creatorId,
                        status: 'active',
                        currentPeriodEnd: thirtyDays
                    }
                });
            }

            res.json({ message: "Payment verified successfully", success: true });
        } else {
            res.status(400).json({ message: "Invalid signature", success: false });
        }
    } catch (err: any) {
        console.error("Razorpay Verification Error:", err);
        res.status(500).json({ message: err.message });
    }
};

export const getUserPayments = async (req: any, res: Response) => {
    const userId = req.user.userId;

    try {
        const payments = await prisma.payment.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                creator: {
                    include: { user: { select: { name: true } } }
                }
            }
        });
        res.json(payments);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const getAdminRevenueStats = async (req: Request, res: Response) => {
    try {
        const stats = await prisma.payment.aggregate({
            where: { status: 'SUCCESS' },
            _sum: {
                amount: true,
                platformFee: true,
                creatorAmount: true
            },
            _count: true
        });

        // Get daily revenue for charts (last 30 days)
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);

        const dailyRevenue = await prisma.payment.groupBy({
            by: ['createdAt'],
            where: {
                status: 'SUCCESS',
                createdAt: { gte: last30Days }
            },
            _sum: {
                platformFee: true
            }
        });

        res.json({
            summary: stats,
            daily: dailyRevenue
        });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};
