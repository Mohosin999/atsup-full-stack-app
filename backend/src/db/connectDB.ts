import { prisma } from '../lib/prisma';
import { env } from '../shared/config/env';

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL');
  } catch (error) {
    console.error('❌ Failed to connect to PostgreSQL:', error);
    process.exit(1);
  }
};

export default connectDB;
