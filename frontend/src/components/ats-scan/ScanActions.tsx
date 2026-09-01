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
  const isAdmin = user?.role === "admin";

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      {isAdmin && (
        <AiScanButton
          onClick={onAiScan}
          disabled={!aiScanAvailable || aiScanDisabled}
          noCredit={!aiScanAvailable}
          loading={aiScanLoading}
        />
      )}
      <ScanButton
        onClick={onScan}
        disabled={scanDisabled}
        loading={scanLoading}
      />
    </div>
  );
}
