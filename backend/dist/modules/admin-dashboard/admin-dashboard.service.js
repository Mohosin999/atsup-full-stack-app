import { prisma } from '../../lib/prisma';
export const getTotalUsers = async () => {
    return prisma.user.count();
};
export const getActiveUsers = async () => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const [resumeUsers, atsUsers] = await Promise.all([
        prisma.resume.groupBy({
            by: ['userId'],
            where: {
                createdAt: {
                    gte: startOfToday,
                },
            },
        }),
        prisma.atsScoreHistory.groupBy({
            by: ['userId'],
            where: {
                createdAt: {
                    gte: startOfToday,
                },
            },
        }),
    ]);
    const userIds = new Set();
    resumeUsers.forEach((u) => userIds.add(u.userId));
    atsUsers.forEach((u) => userIds.add(u.userId));
    return userIds.size;
};
export const getTodayNewUsers = async () => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return prisma.user.count({
        where: {
            createdAt: {
                gte: startOfToday,
            },
        },
    });
};
// GMT+6 (Bangladesh) has no daylight saving, so a fixed offset is safe.
const TZ_OFFSET_MS = 6 * 60 * 60 * 1000;
// Format a Date's GMT+6 wall-clock time as "YYYY-MM-DDTHH".
const toGmt6HourKey = (date) => new Date(date.getTime() + TZ_OFFSET_MS).toISOString().slice(0, 13);
// Format a Date's GMT+6 wall-clock date as "YYYY-MM-DD".
const toGmt6DayKey = (date) => new Date(date.getTime() + TZ_OFFSET_MS).toISOString().slice(0, 10);
// Build a Date (UTC instant) from GMT+6 wall-clock components.
const fromGmt6 = (year, month, day, hour = 0) => new Date(Date.UTC(year, month, day, hour) - TZ_OFFSET_MS);
const buildBuckets = (start, end, hourly) => {
    const keys = [];
    const labels = [];
    const cursor = new Date(start);
    while (cursor < end) {
        if (hourly) {
            const key = toGmt6HourKey(cursor); // YYYY-MM-DDTHH in GMT+6
            keys.push(key);
            labels.push(`${key.slice(11)}:00`);
            cursor.setUTCHours(cursor.getUTCHours() + 1);
        }
        else {
            const key = toGmt6DayKey(cursor); // YYYY-MM-DD in GMT+6
            keys.push(key);
            labels.push(`${key.slice(8)}/${key.slice(5, 7)}`);
            cursor.setUTCDate(cursor.getUTCDate() + 1);
        }
    }
    return { keys, labels };
};
const fetchSeries = async (model, dateField, start, end, hourly) => {
    const { keys, labels } = buildBuckets(start, end, hourly);
    const counts = {};
    keys.forEach((k) => (counts[k] = 0));
    const records = await prisma[model].findMany({
        where: {
            [dateField]: { gte: start, lt: end },
        },
        select: { [dateField]: true },
    });
    records.forEach((record) => {
        const t = new Date(record[dateField]);
        const key = hourly ? toGmt6HourKey(t) : toGmt6DayKey(t);
        if (counts[key] !== undefined)
            counts[key]++;
    });
    return { labels, values: keys.map((k) => counts[k]) };
};
const sum = (values) => values.reduce((a, b) => a + b, 0);
const getWindow = (period) => {
    const now = new Date();
    const shifted = new Date(now.getTime() + TZ_OFFSET_MS);
    const year = shifted.getUTCFullYear();
    const month = shifted.getUTCMonth();
    const day = shifted.getUTCDate();
    let start;
    let end;
    let hourly = false;
    if (period === 'today') {
        start = fromGmt6(year, month, day);
        end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
        hourly = true;
    }
    else if (period === 'yesterday') {
        start = fromGmt6(year, month, day - 1);
        end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
        hourly = true;
    }
    else if (period === '7d') {
        start = fromGmt6(year, month, day - 6);
        end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
    else if (period === '14d') {
        start = fromGmt6(year, month, day - 13);
        end = new Date(start.getTime() + 14 * 24 * 60 * 60 * 1000);
    }
    else {
        // 30d
        start = fromGmt6(year, month, day - 29);
        end = new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
    const length = end.getTime() - start.getTime();
    const prevStart = new Date(start.getTime() - length);
    const prevEnd = new Date(start);
    return { start, end, prevStart, prevEnd, hourly };
};
export const getGrowthData = async (period) => {
    const { start, end, prevStart, prevEnd, hourly } = getWindow(period);
    const [atsUse, resumeBuild, prevAtsUse, prevResumeBuild] = await Promise.all([
        fetchSeries('atsScoreHistory', 'createdAt', start, end, hourly),
        fetchSeries('resume', 'createdAt', start, end, hourly),
        fetchSeries('atsScoreHistory', 'createdAt', prevStart, prevEnd, hourly),
        fetchSeries('resume', 'createdAt', prevStart, prevEnd, hourly),
    ]);
    const activity = sum(atsUse.values) + sum(resumeBuild.values);
    const prevActivity = sum(prevAtsUse.values) + sum(prevResumeBuild.values);
    const change = prevActivity === 0
        ? 0
        : Math.round(((activity - prevActivity) / prevActivity) * 1000) / 10;
    return {
        period,
        labels: atsUse.labels,
        series: {
            atsUse: atsUse.values,
            resumeBuild: resumeBuild.values,
        },
        totals: {
            atsUse: sum(atsUse.values),
            resumeBuild: sum(resumeBuild.values),
            activity,
        },
        change,
    };
};
export const getResumeBuilderUsersToday = async () => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return prisma.resume.count({
        where: {
            createdAt: {
                gte: startOfToday,
            },
        },
    });
};
export const getATSCheckUsersToday = async () => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return prisma.atsScoreHistory.count({
        where: {
            createdAt: {
                gte: startOfToday,
            },
        },
    });
};
export const getBestFeatureToday = async () => {
    const [resumeCount, atsCount] = await Promise.all([
        getResumeBuilderUsersToday(),
        getATSCheckUsersToday(),
    ]);
    return resumeCount > atsCount ? 'resume-builder' : 'ats-check';
};
export const getAdminDashboardMetrics = async () => {
    const [totalUsers, activeUsers, todayNewUsers, resumeBuilderUsersToday, atsCheckUsersToday, bestFeatureToday,] = await Promise.all([
        getTotalUsers(),
        getActiveUsers(),
        getTodayNewUsers(),
        getResumeBuilderUsersToday(),
        getATSCheckUsersToday(),
        getBestFeatureToday(),
    ]);
    return {
        totalUsers,
        activeUsers,
        todayNewUsers,
        resumeBuilderUsersToday,
        atsCheckUsersToday,
        bestFeatureToday,
    };
};
export const getUsersForAdmin = async () => {
    return prisma.user.findMany({
        orderBy: [{ createdAt: "desc" }],
        select: {
            id: true,
            email: true,
            name: true,
            picture: true,
            role: true,
            isBanned: true,
            createdAt: true,
            lastLoginAt: true,
            subscription: true,
        },
    });
};
const getTargetUser = async (userId) => {
    const target = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true },
    });
    if (!target) {
        throw Object.assign(new Error("User not found"), { status: 404 });
    }
    return target;
};
export const setUserBan = async (adminId, userId, isBanned) => {
    if (adminId === userId) {
        throw Object.assign(new Error("You cannot ban your own account"), {
            status: 400,
        });
    }
    return prisma.user.update({
        where: { id: userId },
        data: { isBanned },
        select: { id: true, name: true, email: true, role: true, isBanned: true },
    });
};
export const adminUpdateUser = async (adminId, userId, data) => {
    if (data.role && !["admin", "user"].includes(data.role)) {
        throw Object.assign(new Error("Invalid role"), { status: 400 });
    }
    const target = await getTargetUser(userId);
    if (data.role === "user" && adminId === userId) {
        throw Object.assign(new Error("You cannot remove your own admin role"), {
            status: 400,
        });
    }
    const updateData = {};
    if (data.name !== undefined)
        updateData.name = data.name;
    if (data.role !== undefined)
        updateData.role = data.role;
    if (data.credits !== undefined) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { subscription: true },
        });
        const sub = user?.subscription || {};
        updateData.subscription = { ...sub, credits: data.credits };
    }
    return prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
            id: true,
            name: true,
            email: true,
            picture: true,
            role: true,
            isBanned: true,
            createdAt: true,
            lastLoginAt: true,
            subscription: true,
        },
    });
};
export const adminDeleteUser = async (adminId, userId) => {
    if (adminId === userId) {
        throw Object.assign(new Error("You cannot delete your own account"), {
            status: 400,
        });
    }
    await prisma.payment.deleteMany({ where: { userId } });
    await prisma.atsScoreHistory.deleteMany({ where: { userId } });
    await prisma.analysis.deleteMany({ where: { userId } });
    await prisma.atsScore.deleteMany({ where: { userId } });
    await prisma.resume.deleteMany({ where: { userId } });
    await prisma.jobDescription.deleteMany({ where: { userId } });
    return prisma.user.delete({ where: { id: userId } });
};
