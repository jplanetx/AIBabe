/*
  Warnings:

  - You are about to drop the column `interests` on the `Girlfriend` table. All the data in the column will be lost.
  - You are about to drop the column `traits` on the `Girlfriend` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Memory` table. All the data in the column will be lost.
  - You are about to drop the column `importance` on the `Memory` table. All the data in the column will be lost.
  - You are about to drop the column `girlfriendId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[key,conversationId]` on the table `Memory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `Memory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `Memory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Memory" DROP CONSTRAINT "Memory_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_girlfriendId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_userId_fkey";

-- AlterTable
ALTER TABLE "Girlfriend" DROP COLUMN "interests",
DROP COLUMN "traits";

-- AlterTable
ALTER TABLE "Memory" DROP COLUMN "content",
DROP COLUMN "importance",
ADD COLUMN     "key" TEXT NOT NULL,
ADD COLUMN     "value" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "girlfriendId",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ALTER COLUMN "isUserMessage" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "active";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerified",
DROP COLUMN "image";

-- CreateTable
CREATE TABLE "UserPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationSummary" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "summarizedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT,
    "rating" INTEGER NOT NULL,
    "optionalComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_userId_key_key" ON "UserPreference"("userId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationSummary_conversationId_key" ON "ConversationSummary"("conversationId");

-- CreateIndex
CREATE INDEX "Feedback_conversationId_idx" ON "Feedback"("conversationId");

-- CreateIndex
CREATE INDEX "Feedback_userId_idx" ON "Feedback"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Memory_key_conversationId_key" ON "Memory"("key", "conversationId");

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationSummary" ADD CONSTRAINT "ConversationSummary_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
