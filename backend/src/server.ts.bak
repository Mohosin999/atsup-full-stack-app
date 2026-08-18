import http from "http";
import app from "./app";
import { connectDB } from "./db";
import { env } from "./shared/config/env";

// Vercel serverless runtime requires the Express app as the default export.
export default app;

// Only start a long-running HTTP server outside of Vercel (local dev, docker).
const isVercel = process.env.VERCEL === "1";

if (!isVercel) {
  const server = http.createServer(app);

  const startServer = async () => {
    try {
      await connectDB();

      server.listen(env.port);

      console.log(`🚀 Server is running on http://localhost:${env.port}`);
    } catch (error) {
      console.error("❌ Failed to connect to PostgreSQL:", error);
      process.exit(1);
    }
  };

  startServer();
}
