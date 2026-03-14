import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRouter from './routes/auth.routes';
import creatorRouter from './routes/creator.routes';
import postRouter from './routes/post.routes';
import subscriptionRouter from './routes/subscription.routes';
import walletRouter from './routes/wallet.routes';
import messageRouter from './routes/message.routes';
import adminRouter from './routes/admin.routes';
import { authenticate } from './middleware/auth.middleware';

import path from 'path';

dotenv.config();

const app = express();

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: false,
}));

app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = process.env.FRONTEND_URL
            ? process.env.FRONTEND_URL.split(',')
            : ['http://localhost:3000', 'http://127.0.0.1:3000'];
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/creators', creatorRouter);
app.use('/api/posts', postRouter);
app.use('/api/subscriptions', subscriptionRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/messages', messageRouter);
app.use('/api/admin', authenticate, adminRouter);


// Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {},
    });
});

export default app;
