export interface AiScanStatus {
  available: boolean;
}

// FIXME: not yet used in this app

export interface AiScanSubscription {
  credits?: number;
  lastAiScanResetDate?: string | null;
}

const getBangladeshCreditDateKey = (d: Date = new Date()): string => {
  const dhakaMs = d.getTime() + 6 * 60 * 60 * 1000;
  const dhaka = new Date(dhakaMs);
  const hour = dhaka.getUTCHours();
  if (hour < 16) dhaka.setUTCDate(dhaka.getUTCDate() - 1);
  return dhaka.toISOString().slice(0, 10);
};

export const getAiScanStatus = (
  subscription?: AiScanSubscription | null,
  role?: string | null,
): AiScanStatus => {
  if (role === "admin") return { available: true };
  const today = getBangladeshCreditDateKey();
  const credits = subscription?.credits ?? 0;
  const lastReset = subscription?.lastAiScanResetDate ?? "";

  return { available: credits >= 1 || lastReset !== today };
};