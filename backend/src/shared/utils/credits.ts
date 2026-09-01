import { prisma } from "../../lib/prisma";

// FIXME: not yet used in this app

const getGmtDateKey = (): string => new Date().toISOString().slice(0, 10);

export const applyDailyCreditReset = async (userId: string, subscription: any) => {
  const today = getGmtDateKey();
  const updatedSubscription = { ...(subscription || {}) };

  if ((updatedSubscription.lastAiScanResetDate ?? "") !== today) {
    // Admin = unlimited, don't reset credits; regular user = 3/day
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (dbUser?.role === "admin") {
      return updatedSubscription;
    }
    updatedSubscription.credits = 3;
    updatedSubscription.lastAiScanResetDate = today;
    await prisma.user.update({
      where: { id: userId },
      data: { subscription: updatedSubscription },
    });
  }

  return updatedSubscription;
};
