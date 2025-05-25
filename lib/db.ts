// lib/db.ts

// Re-export the singleton Prisma client
import { prisma } from "@/lib/prisma";
export const db = prisma;
