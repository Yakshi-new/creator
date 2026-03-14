import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { URL } from 'url';

dotenv.config();

const dbUrl = new URL(process.env.DATABASE_URL || 'mysql://user:password@localhost:3306/creator_platform');

const adapter = new PrismaMariaDb({
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port) || 3306,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.replace('/', ''),
});

const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Seeding database...');

    const adminEmail = 'bhadmin@test.com';
    const adminPassword = 'Bh@123654';

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail }
    });

    if (existingAdmin) {
        console.log('✅ Admin user already exists.');
        return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const admin = await prisma.user.create({
        data: {
            email: adminEmail,
            password: hashedPassword,
            name: 'Super Admin',
            role: 'ADMIN',
            isVerified: true,
        },
    });

    console.log('🚀 Super Admin created successfully!');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        // Disconnect Prisma
    });
