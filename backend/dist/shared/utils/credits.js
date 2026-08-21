import { prisma } from "../../lib/prisma";
const getGmtDateKey = () => new Date().toISOString().slice(0, 10);
export const applyDailyCreditReset = async (userId, subscription) => {
    const today = getGmtDateKey();
    const updatedSubscription = { ...(subscription || {}) };
    if ((updatedSubscription.lastAiScanResetDate ?? "") !== today) {
        updatedSubscription.credits = 5;
        updatedSubscription.lastAiScanResetDate = today;
        await prisma.user.update({
            where: { id: userId },
            data: { subscription: updatedSubscription },
        });
    }
    return updatedSubscription;
};
