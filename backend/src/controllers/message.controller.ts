import { Response } from 'express';
import { prisma } from '../lib/prisma';

export const getConversations = async (req: any, res: Response) => {
    const userId = req.user.userId;

    try {
        // Find users who sent messages to me or received from me
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            include: {
                sender: { select: { id: true, name: true } },
                receiver: { select: { id: true, name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Group by user id to get distinct conversations
        const convMap = new Map();
        
        messages.forEach(msg => {
            const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
            if (!convMap.has(otherUser.id)) {
                convMap.set(otherUser.id, {
                    id: otherUser.id, // Using otherUser.id as conv ID for simplicity
                    fan: { id: otherUser.id, name: otherUser.name },
                    lastMessage: msg.content || (msg.isPaid ? 'Locked Message 🔒' : ''),
                    lastAt: msg.createdAt,
                    unread: 0, // Placeholder
                    messages: [] // We'll fetch these when active
                });
            }
        });

        res.json(Array.from(convMap.values()));
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const getMessages = async (req: any, res: Response) => {
    const userId = req.user.userId;
    const otherUserId = req.params.otherUserId;

    try {
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: userId }
                ]
            },
            orderBy: { createdAt: 'asc' }
        });

        res.json(messages);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const sendMessage = async (req: any, res: Response) => {
    const senderId = req.user.userId;
    const { receiverId, content, isPaid, price } = req.body;

    try {
        const message = await prisma.message.create({
            data: {
                senderId,
                receiverId: receiverId,
                content,
                isPaid: !!isPaid,
                price: isPaid ? Number(price) : null,
                isUnlocked: false
            }
        });

        res.status(201).json(message);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};
