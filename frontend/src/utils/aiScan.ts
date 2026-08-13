export interface AiScanStatus {
  available: boolean;
}

export interface AiScanSubscription {
  credits?: number;
  lastAiScanResetDate?: string | null;
}

const getGmtDateKey = (d: Date = new Date()): string =>
  d.toISOString().slice(0, 10);

export const getAiScanStatus = (
  subscription?: AiScanSubscription | null,
): AiScanStatus => {
  const today = getGmtDateKey();
  const credits = subscription?.credits ?? 0;
  const lastReset = subscription?.lastAiScanResetDate ?? "";

  return { available: credits >= 1 || lastReset !== today };
};