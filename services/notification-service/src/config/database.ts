import { PrismaClient } from "@prisma/client";
import { Logger } from "@ecommerce/common";

const logger = new Logger("notification-service");

export const prisma = new PrismaClient();

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info("Connected to MongoDB via Prisma");
  } catch (error) {
    logger.error("Failed to connect to MongoDB", error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info("Disconnected from MongoDB");
}


