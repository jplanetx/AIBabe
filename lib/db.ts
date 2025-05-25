// lib/db.ts

// Re-export the singleton Prisma client
import { prisma } from "@/lib/prismaClient";
export const db = prisma;
