import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const submitKyc = async (req: any, res: Response) => {
    const userId = req.user.userId;
    const { idNumber, panCardNumber, bankAccountNumber, bankIfscCode } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ message: 'ID document is required' });
    }

    if (!idNumber || !panCardNumber || !bankAccountNumber || !bankIfscCode) {
        return res.status(400).json({ message: 'All KYC and Bank details are required' });
    }

    try {
        const creator = await (prisma as any).creator.findUnique({ where: { userId } });
        if (!creator) return res.status(404).json({ message: 'Creator profile not found' });

        await (prisma as any).creator.update({
            where: { userId },
            data: {
                kycStatus: 'PENDING',
                kycDocument: `/uploads/${file.filename}`,
                idNumber,
                panCardNumber,
                bankAccountNumber,
                bankIfscCode,
                kycRejectionReason: null
            }
        });

        res.json({ message: 'KYC and Bank details submitted for review' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const getKycStatus = async (req: any, res: Response) => {
    const userId = req.user.userId;

    try {
        const creator = await (prisma as any).creator.findUnique({
            where: { userId },
            select: { 
                kycStatus: true, 
                kycRejectionReason: true, 
                isKycVerified: true,
                panCardNumber: true,
                bankAccountNumber: true,
                bankIfscCode: true,
                idNumber: true 
            }
        });
        res.json(creator);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const adminGetKycSubmissions = async (req: Request, res: Response) => {
    try {
        const submissions = await (prisma as any).creator.findMany({
            where: {
                kycStatus: 'PENDING'
            },
            include: {
                user: { select: { name: true, email: true } }
            }
        });
        res.json(submissions);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const adminProcessKyc = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { status, reason } = req.body; // APPROVED or REJECTED

    try {
        await (prisma as any).creator.update({
            where: { id },
            data: {
                kycStatus: status,
                isKycVerified: status === 'APPROVED',
                kycRejectionReason: status === 'REJECTED' ? reason : null
            }
        });

        res.json({ message: `KYC ${status.toLowerCase()} successfully` });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};
