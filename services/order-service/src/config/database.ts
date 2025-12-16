import { PrismaClient } from "@prisma/client";
import { Logger } from "@ecommerce/common";

const logger = new Logger("order-service");

export const prisma = new PrismaClient();

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info("Connected to PostgreSQL via Prisma");
  } catch (error) {
    logger.error("Failed to connect to PostgreSQL", error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info("Disconnected from PostgreSQL");
}
