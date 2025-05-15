/*
  Warnings:

  - You are about to drop the column `rating` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Favorite` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `bio` to the `Character` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentPeriodEnd` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentPeriodStart` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Favorite" DROP CONSTRAINT "Favorite_characterId_fkey";

-- DropForeignKey
ALTER TABLE "Favorite" DROP CONSTRAINT "Favorite_userId_fkey";

-- AlterTable
ALTER TABLE "Character" DROP COLUMN "rating",
DROP COLUMN "type",
ADD COLUMN     "bio" TEXT NOT NULL,
ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "favoriteQuote" TEXT,
ALTER COLUMN "personality" SET NOT NULL,
ALTER COLUMN "personality" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "endDate",
DROP COLUMN "startDate",
ADD COLUMN     "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "currentPeriodStart" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
ADD COLUMN     "hashedPassword" TEXT;

-- DropTable
DROP TABLE "Favorite";

-- CreateTable
CREATE TABLE "Memory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "importance" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Memory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;
