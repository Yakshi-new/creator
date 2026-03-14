/*
  Warnings:

  - You are about to drop the column `stripeAccountId` on the `creator` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `follow` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `like` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `link` on the `notification` table. All the data in the column will be lost.
  - You are about to drop the column `stripeIntentId` on the `payment` table. All the data in the column will be lost.
  - You are about to alter the column `type` on the `payment` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(2))`.
  - You are about to drop the column `updatedAt` on the `subscription` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `tip` table. All the data in the column will be lost.
  - You are about to drop the column `twoFactorSecret` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `payout` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `report` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `payout` DROP FOREIGN KEY `Payout_creatorId_fkey`;

-- DropForeignKey
ALTER TABLE `report` DROP FOREIGN KEY `Report_reporterId_fkey`;

-- DropIndex
DROP INDEX `Payment_stripeIntentId_key` ON `payment`;

-- AlterTable
ALTER TABLE `creator` DROP COLUMN `stripeAccountId`;

-- AlterTable
ALTER TABLE `follow` DROP COLUMN `createdAt`;

-- AlterTable
ALTER TABLE `like` DROP COLUMN `createdAt`;

-- AlterTable
ALTER TABLE `media` DROP COLUMN `metadata`,
    ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `notification` DROP COLUMN `link`,
    MODIFY `content` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `payment` DROP COLUMN `stripeIntentId`,
    ADD COLUMN `creatorAmount` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `creatorId` INTEGER NULL,
    ADD COLUMN `platformFee` DOUBLE NOT NULL DEFAULT 0,
    MODIFY `type` ENUM('SUBSCRIPTION', 'TIP', 'PAID_POST', 'WALLET_DEPOSIT') NOT NULL;

-- AlterTable
ALTER TABLE `post` ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `subscription` DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `tip` DROP COLUMN `status`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `twoFactorSecret`,
    ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE `payout`;

-- DropTable
DROP TABLE `report`;

-- CreateTable
CREATE TABLE `GlobalSetting` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `GlobalSetting_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Tip` ADD CONSTRAINT `Tip_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `Creator`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
