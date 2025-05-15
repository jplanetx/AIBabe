/*
  Warnings:

  - You are about to drop the column `characterId` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `characterId` on the `Memory` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Memory` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Memory` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Memory` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `isUserMessage` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `hashedPassword` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Character` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Favorite` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `personalityId` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `text` to the `Memory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Memory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sender` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `text` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_characterId_fkey";

-- DropForeignKey
ALTER TABLE "Favorite" DROP CONSTRAINT "Favorite_characterId_fkey";

-- DropForeignKey
ALTER TABLE "Favorite" DROP CONSTRAINT "Favorite_userId_fkey";

-- DropForeignKey
ALTER TABLE "Memory" DROP CONSTRAINT "Memory_characterId_fkey";

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "characterId",
ADD COLUMN     "personalityId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Memory" DROP COLUMN "characterId",
DROP COLUMN "date",
DROP COLUMN "description",
DROP COLUMN "title",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "importance" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "source" TEXT,
ADD COLUMN     "text" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "content",
DROP COLUMN "isUserMessage",
ADD COLUMN     "sender" TEXT NOT NULL,
ADD COLUMN     "text" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "expiresAt",
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "messageLimit" INTEGER NOT NULL DEFAULT 15,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "plan" SET DEFAULT 'free',
ALTER COLUMN "status" SET DEFAULT 'active';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerified",
DROP COLUMN "hashedPassword",
DROP COLUMN "image",
ADD COLUMN     "password" TEXT NOT NULL;

-- DropTable
DROP TABLE "Character";

-- DropTable
DROP TABLE "Favorite";

-- CreateTable
CREATE TABLE "Personality" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "greeting" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Personality_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_personalityId_fkey" FOREIGN KEY ("personalityId") REFERENCES "Personality"("id") ON DELETE CASCADE ON UPDATE CASCADE;
