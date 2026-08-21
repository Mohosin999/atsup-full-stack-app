import { Server } from "socket.io";
import { verifyAccessToken } from "../shared/config/jwt";
import { prisma } from "../lib/prisma";
import { applyDailyCreditReset } from "../shared/utils/credits";
import { getAdminDashboardMetrics, getGrowthData, } from "../modules/admin-dashboard/admin-dashboard.service";
import { setAdminNamespace } from "./adminSocket";
import { env } from "../shared/config/env";
const onlineUsers = new Map();
const getPresencePayload = () => ({
    onlineCount: onlineUsers.size,
    users: Array.from(onlineUsers.values()).map(({ id, name, email, picture }) => ({
        id,
        name,
        email,
        picture,
    })),
});
const authenticateSocket = async (socket, next) => {
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
    }
    catch (error) {
        console.error("Socket authentication error:", error);
        next(new Error("Authentication error: Invalid token"));
    }
};
const broadcastPresence = (namespace) => {
    namespace.emit("presence", getPresencePayload());
};
export const initSocket = (server) => {
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
    const adminNamespace = io.of("/admin-dashboard");
    setAdminNamespace(adminNamespace);
    adminNamespace.use(authenticateSocket);
    adminNamespace.use((socket, next) => {
        if (socket.data.user?.role !== "admin") {
            return next(new Error("Forbidden: Admin access only"));
        }
        next();
    });
    io.use(authenticateSocket);
    io.on("connection", (socket) => {
        const user = socket.data.user;
        const existing = onlineUsers.get(user.id);
        if (existing) {
            existing.sockets += 1;
        }
        else {
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
        socket.emit("presence", getPresencePayload());
        socket.data.growthPeriod = "today";
        const sendMetrics = async () => {
            try {
                const metrics = await getAdminDashboardMetrics();
                socket.emit("metrics", metrics);
            }
            catch (error) {
                console.error("Error sending metrics:", error);
                socket.emit("metrics_error", { message: "Failed to fetch metrics" });
            }
        };
        const sendGrowth = async () => {
            try {
                const growth = await getGrowthData(socket.data.growthPeriod);
                socket.emit("growth", growth);
            }
            catch (error) {
                console.error("Error sending growth data:", error);
            }
        };
        socket.on("set-period", (period) => {
            if (["yesterday", "today", "7d", "14d", "30d"].includes(period)) {
                socket.data.growthPeriod = period;
                sendGrowth();
            }
        });
        const interval = setInterval(() => {
            sendMetrics();
            sendGrowth();
        }, 5000);
        sendMetrics();
        sendGrowth();
        socket.on("disconnect", () => {
            console.log(`Admin dashboard client disconnected: ${socket.id}`);
            clearInterval(interval);
        });
    });
    return io;
};
