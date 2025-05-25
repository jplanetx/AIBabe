// lib/prismaClient.ts
import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Reuse the client across hot-reloads in development
export const prisma =
  global.prisma ||
  new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
