/*
  Warnings:

  - The original migration attempted to add a non-nullable `userId` column to the `Memory` table
    without a default value. This would fail if the `Memory` table already contains data.
  - To address this, the `userId` column is now added as nullable.

  - IMPORTANT POST-MIGRATION STEPS:
  - 1. If there are existing rows in the "Memory" table, you MUST populate the "userId"
  -    field for these rows with valid User IDs.
  - 2. After ensuring all "userId" fields are populated, create and apply a NEW migration
  -    to alter the "userId" column to be NOT NULL.
  -    Example SQL for the new migration:
  -    ALTER TABLE "Memory" ALTER COLUMN "userId" SET NOT NULL;
  -    Alternatively, update your Prisma schema to ensure `userId` is non-nullable on `Memory`
  -    and `prisma migrate dev` will generate the necessary ALTER statement.

*/
-- AlterTable
ALTER TABLE "Memory" ADD COLUMN     "userId" TEXT; -- Changed from NOT NULL to allow NULL initially

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "personality" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "coverImage" TEXT,
    "bio" TEXT NOT NULL,
    "interests" TEXT,
    "favoriteQuote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileData" TEXT NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confidenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- AddForeignKey
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
