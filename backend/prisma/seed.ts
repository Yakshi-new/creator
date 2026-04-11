import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database (MongoDB)...');

    const adminEmail = 'bhadmin@test.com';
    const adminPassword = 'Bh@123654';

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail }
    });

    if (existingAdmin) {
        console.log('✅ Admin user already exists.');
    } else {
        const hashedPassword = await bcrypt.hash(adminPassword, 12);
        await prisma.user.create({
            data: {
                email: adminEmail,
                password: hashedPassword,
                name: 'Super Admin',
                role: 'ADMIN',
                isVerified: true,
                updatedAt: new Date(),
            },
        });
        console.log('🚀 Super Admin created successfully!');
        console.log(`📧 Email: ${adminEmail}`);
        console.log(`🔑 Password: ${adminPassword}`);
    }

    // Add some sample data if needed (e.g. Creator user)
    const creatorEmail = 'testcreator@test.com';
    const existingCreator = await prisma.user.findUnique({
        where: { email: creatorEmail }
    });

    if (!existingCreator) {
        const hashedCreatorPassword = await bcrypt.hash('Creator123!', 12);
        const creatorUser = await prisma.user.create({
            data: {
                email: creatorEmail,
                password: hashedCreatorPassword,
                name: 'Test Creator',
                role: 'CREATOR',
                isVerified: true,
                updatedAt: new Date(),
                creator: {
                    create: {
                        bio: 'This is a test creator account.',
                        subscriptionPrice: 10.0,
                        isKycVerified: true,
                        kycStatus: 'APPROVED',
                        updatedAt: new Date(),
                    }
                }
            }
        });
        console.log('🚀 Test Creator created successfully!');
    } else {
        console.log('✅ Test Creator already exists.');
    }
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
