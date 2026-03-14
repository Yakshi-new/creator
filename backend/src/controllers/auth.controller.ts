import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().optional(),
    role: z.enum(['FAN', 'CREATOR']).default('FAN'),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, name, role } = registerSchema.parse(req.body);

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role,
                creatorProfile: role === 'CREATOR' ? { create: {} } : undefined,
            },
        });

        res.status(201).json({ message: 'User registered successfully', userId: user.id });
    } catch (err: any) {
        res.status(400).json({ message: err.errors || err.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await prisma.user.findFirst({
            where: {
                email: email,
                isDeleted: false
            },
            include: {
                creatorProfile: { select: { id: true } }
            }
        })
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const accessToken = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_ACCESS_SECRET || 'access_secret',
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_REFRESH_SECRET || 'refresh_secret',
            { expiresIn: '7d' }
        );

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // In login controller (backend)
        res.json({
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                creatorId: user.creatorProfile?.id || null, // <-- send this
            },
        });
    } catch (err: any) {
        res.status(400).json({ message: err.errors || err.message });
    }
};

export const logout = (req: Request, res: Response) => {
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
};

export const refreshToken = async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refresh_secret') as { userId: number };
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

        if (!user) return res.status(401).json({ message: 'User not found' });

        const accessToken = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_ACCESS_SECRET || 'access_secret',
            { expiresIn: '15m' }
        );

        res.json({ accessToken });
    } catch (err) {
        res.status(401).json({ message: 'Invalid refresh token' });
    }
};

// --- FORGOT PASSWORD (DEMO MODE) ---
export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
        const user = await prisma.user.findFirst({ where: { email, isDeleted: false } });
        if (!user) return res.status(404).json({ message: 'No account found with this email' });
        
        // In a real app, send a reset link via email here.
        // For this demo, we'll just return success.
        res.json({ message: 'Password reset link sent to your email' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    const { email, newPassword } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });
        res.json({ message: 'Password reset successfully' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};
