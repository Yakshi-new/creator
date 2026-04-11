import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import Redis from 'ioredis';

let redis: Redis | null = null;

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

// Initialize Redis for Socket.io adapter or internal caching
try {
    redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
            if (times > 3) {
                console.log("Redis connection failed, continuing without Redis");
                return null;
            }
            return Math.min(times * 200, 2000);
        }
    });

    redis.on("connect", () => {
        console.log("Redis connected");
    });

    redis.on("error", (err) => {
        console.log("Redis error:", err.message);
    });

} catch (error) {
    console.log("Redis disabled");
}
// Initialize Socket.io
// Initialize Socket.io
const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',')
    : ['http://localhost:3100'];

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Basic Socket.io Connection Logic
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_room', (roomId: string) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room: ${roomId}`);
    });

    socket.on('send_message', (data: { roomId: string, content: string, senderId: string }) => {
        io.to(data.roomId).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(PORT as number, '127.0.0.1', () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});

export { io, redis };
