import { prisma } from '../lib/prisma';
const connectDB = async () => {
    try {
        await prisma.$connect();
    }
    catch (error) {
        console.error('❌ Failed to connect to PostgreSQL:', error);
        process.exit(1);
    }
};
export default connectDB;
