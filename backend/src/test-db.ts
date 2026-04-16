import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function testConnection() {
    try {
        console.log('Testing database connection...');
        console.log('DATABASE_URL:', process.env.DATABASE_URL);
        await prisma.$connect();
        console.log('Database connected successfully!');
        const userCount = await prisma.user.count();
        console.log('User count:', userCount);
    } catch (error) {
        console.error('Database connection failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();
