import http from "http";
import app from "./app";
import { connectDB } from "./db";
import { env } from "./shared/config/env";
import { Server, Socket } from "socket.io";
import { verifyAccessToken } from "./shared/config/jwt";
import { prisma } from "./lib/prisma";
import { applyDailyCreditReset } from "./shared/utils/credits";
import {
  getAdminDashboardMetrics,
  getGrowthData,
} from "./modules/admin-dashboard/admin-dashboard.service";
import { setAdminNamespace } from "./socket/adminSocket";

interface OnlineUser {
  id: string;
  name: string;
  email: string;
  picture?: string;
  sockets: number;
}

// Live online-user presence, tracked from the default namespace (like a chat app).
const onlineUsers = new Map<string, OnlineUser>();

const getPresencePayload = () => ({
  onlineCount: onlineUsers.size,
  users: Array.from(onlineUsers.values()).map(({ id, name, email, picture }) => ({
    id,
    name,
    email,
    picture,
  })),
});

const authenticateSocket = async (socket: Socket, next: (err?: Error) => void) => {
  try {
    let token = socket.handshake.auth.token?.accessToken ||
      socket.handshake.headers.cookie?.split(';').find(c => c.trim().startsWith('accessToken='))?.split('=')[1] ||
      socket.handshake.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      return next(new Error("Authentication error: Token not provided"));
    }

    const decoded = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    if (user.isBanned) {
      return next(new Error("Authentication error: Account banned"));
    }

    const subscription = await applyDailyCreditReset(user.id, user.subscription);

    // Attach user to socket
    socket.data.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      googleId: user.googleId || undefined,
      picture: user.picture || undefined,
      preferences: user.preferences,
      subscription: user.subscription,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error("Socket authentication error:", error);
    next(new Error("Authentication error: Invalid token"));
  }
};

const broadcastPresence = (namespace: any) => {
  namespace.emit("presence", getPresencePayload());
};

// Vercel serverless runtime requires the Express app as the default export.
export default app;

// Only start a long-running HTTP server outside of Vercel (local dev, docker).
const isVercel = process.env.VERCEL === "1";

if (!isVercel) {
  const server = http.createServer(app);

  // Initialize Socket.io
  const io = new Server(server, {
    cors: {
      origin: [
        env.frontendUrl,
        "http://localhost:5173",
        "http://localhost:4173",
        "http://localhost:3000",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Define the admin dashboard namespace
  const adminNamespace = io.of("/admin-dashboard");
  setAdminNamespace(adminNamespace);

  adminNamespace.use(authenticateSocket);
  adminNamespace.use((socket, next) => {
    if (socket.data.user?.role !== "admin") {
      return next(new Error("Forbidden: Admin access only"));
    }
    next();
  });

  // User presence namespace (default "/"): authenticated users connect here so
  // admins can see who is online in real time.
  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    const user = socket.data.user as {
      id: string;
      name: string;
      email: string;
      picture?: string;
    };

    const existing = onlineUsers.get(user.id);
    if (existing) {
      existing.sockets += 1;
    } else {
      onlineUsers.set(user.id, {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        sockets: 1,
      });
    }
    broadcastPresence(adminNamespace);

    socket.on("disconnect", () => {
      const entry = onlineUsers.get(user.id);
      if (entry) {
        entry.sockets -= 1;
        if (entry.sockets <= 0) {
          onlineUsers.delete(user.id);
        }
      }
      broadcastPresence(adminNamespace);
    });
  });

  adminNamespace.on("connection", (socket) => {
    console.log(`Admin dashboard client connected: ${socket.id}`);

    // Send the current presence snapshot immediately
    socket.emit("presence", getPresencePayload());

    // Track which period the client is viewing so the growth chart can be
    // streamed live, just like the metrics.
    socket.data.growthPeriod = "today";

    // Send metrics immediately upon connection
    const sendMetrics = async () => {
      try {
        const metrics = await getAdminDashboardMetrics();
        socket.emit("metrics", metrics);
      } catch (error) {
        console.error("Error sending metrics:", error);
        socket.emit("metrics_error", { message: "Failed to fetch metrics" });
      }
    };

    // Stream the growth chart data for the client's selected period
    const sendGrowth = async () => {
      try {
        const growth = await getGrowthData(socket.data.growthPeriod as any);
        socket.emit("growth", growth);
      } catch (error) {
        console.error("Error sending growth data:", error);
      }
    };

    // Client changes the chart period (e.g. Today / Last 7 days)
    socket.on("set-period", (period: string) => {
      if (["yesterday", "today", "7d", "14d", "30d"].includes(period)) {
        socket.data.growthPeriod = period;
        sendGrowth();
      }
    });

    // Send metrics and growth every 5 seconds
    const interval = setInterval(() => {
      sendMetrics();
      sendGrowth();
    }, 5000);

    // Send initial metrics and growth
    sendMetrics();
    sendGrowth();

    socket.on("disconnect", () => {
      console.log(`Admin dashboard client disconnected: ${socket.id}`);
      clearInterval(interval);
    });
  });

  const startServer = async () => {
    try {
      await connectDB();

      server.listen(env.port);

      console.log(`🚀 Server is running on http://localhost:${env.port}`);
      console.log(`🔌 Socket.io server is running on port ${env.port}`);
    } catch (error) {
      console.error("❌ Failed to connect to PostgreSQL:", error);
      process.exit(1);
    }
  };

  startServer();
}
