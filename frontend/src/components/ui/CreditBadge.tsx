import { useAppSelector } from "@/hooks";

const getBangladeshCreditDateKey = (): string => {
  const now = new Date();
  const dhakaMs = now.getTime() + 6 * 60 * 60 * 1000;
  const dhaka = new Date(dhakaMs);
  const hour = dhaka.getUTCHours();
  if (hour < 16) dhaka.setUTCDate(dhaka.getUTCDate() - 1);
  return dhaka.toISOString().slice(0, 10);
};

export default function CreditBadge() {
  const user = useAppSelector((state) => state.auth.user);

  if (!user || user.role === "admin") return null;

  const today = getBangladeshCreditDateKey();
  const credits = user.subscription?.credits ?? 0;
  const lastReset = user.subscription?.lastAiScanResetDate ?? "";
  const effectiveCredits = lastReset !== today ? 7 : credits;
  const exhausted = effectiveCredits < 1;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
        exhausted
          ? "bg-red-500/10 dark:bg-white text-red-500"
          : "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
      }`}
    >
      {exhausted
        ? "0 credits — New quota at 4 PM BST"
        : `${effectiveCredits} credits remaining`}
    </div>
  );
}
