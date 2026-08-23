import { prisma } from "../../lib/prisma";

// FIXME: not yet used in this app

const getGmtDateKey = (): string => new Date().toISOString().slice(0, 10);

export const applyDailyCreditReset = async (userId: string, subscription: any) => {
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
