const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');

async function connectDB() {
  try {
    await prisma.$connect();
    logger.info('Connected to PostgreSQL Database via Prisma');
  } catch (error) {
    logger.error('Database connection failed: ' + error.message);
    process.exit(1);
  }
}

async function disconnectDB() {
  await prisma.$disconnect();
  logger.info('Disconnected from Database');
}

module.exports = {
  prisma,
  connectDB,
  disconnectDB
};