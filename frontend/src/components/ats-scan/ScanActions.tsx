import { useAppSelector } from "@/hooks";
import AiScanButton from "./AiScanButton";
import ScanButton from "./ScanButton";

export interface ScanActionsProps {
  aiScanAvailable: boolean;
  aiScanDisabled?: boolean;
  aiScanLoading?: boolean;
  scanDisabled?: boolean;
  scanLoading?: boolean;
  onAiScan: () => void;
  onScan: () => void;
}

export default function ScanActions({
  aiScanAvailable,
  aiScanDisabled,
  aiScanLoading,
  scanDisabled,
  scanLoading,
  onAiScan,
  onScan,
}: ScanActionsProps) {
  const user = useAppSelector((s) => s.auth.user);
  const credits = user?.subscription?.credits ?? 0;

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {credits}/3 credits
        </span>
        <AiScanButton
          onClick={onAiScan}
          disabled={!aiScanAvailable || aiScanDisabled}
          noCredit={!aiScanAvailable}
          loading={aiScanLoading}
        />
      </div>
      <ScanButton
        onClick={onScan}
        disabled={scanDisabled}
        loading={scanLoading}
      />
    </div>
  );
}
