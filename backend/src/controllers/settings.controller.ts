import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getSetting = async (req: Request, res: Response) => {
    const key = req.params.key as string;
    try {
        const setting = await prisma.globalsetting.findUnique({
            where: { key }
        });
        res.json(setting);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const updateSetting = async (req: Request, res: Response) => {
    const { key, value } = req.body;
    try {
        const setting = await prisma.globalsetting.upsert({
            where: { key },
            update: { value: value.toString(), updatedAt: new Date() },
            create: { key, value: value.toString(), updatedAt: new Date() }
        });
        res.json(setting);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const getAllSettings = async (req: Request, res: Response) => {
    try {
        const settings = await prisma.globalsetting.findMany();
        res.json(settings);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};
