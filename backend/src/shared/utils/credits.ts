import { prisma } from "../../lib/prisma";

// FIXME: not yet used in this app

/**
 * Credit day is based on 4 PM BST (Asia/Dhaka, UTC+6) = 10:00 UTC.
 * If current Dhaka time is before 16:00, the credit day is previous Dhaka date.
 */
export const getBangladeshCreditDateKey = (): string => {
  const now = new Date();
  // Convert to Dhaka wall-clock time (UTC+6)
  const dhakaMs = now.getTime() + 6 * 60 * 60 * 1000;
  const dhaka = new Date(dhakaMs);
  const hour = dhaka.getUTCHours();
  // If before 16:00 Dhaka, credit day is yesterday
  if (hour < 16) {
    dhaka.setUTCDate(dhaka.getUTCDate() - 1);
  }
  return dhaka.toISOString().slice(0, 10);
};

// Deprecated alias for backward compatibility
const getGmtDateKey = getBangladeshCreditDateKey;

export const applyDailyCreditReset = async (userId: string, subscription: any) => {
  const today = getBangladeshCreditDateKey();
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
