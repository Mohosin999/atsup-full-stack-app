import http from 'http';
import app from './app';
import { connectDB } from './db';
import { env } from './config/env';

const server = http.createServer(app);

const startServer = async () => {
  try {
    await connectDB();

    server.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });
  } catch (error) {
/* empty */
    process.exit(1);
  }
};

startServer();
