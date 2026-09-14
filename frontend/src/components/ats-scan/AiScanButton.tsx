import { Loader2, ArrowRight } from "lucide-react";

interface AiScanButtonProps {
  disabled?: boolean;
  noCredit?: boolean;
  loading?: boolean;
  onClick: () => void;
}

export default function AiScanButton({
  disabled,
  noCredit,
  loading,
  onClick,
}: AiScanButtonProps) {
  return (
    <div className="relative inline-flex group">
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 text-sm font-semibold text-white rounded-xl bg-cyan-600 hover:bg-cyan-700 shadow-lg shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? "Analyzing..." : "Scan Now"}
        {!loading && (
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        )}
      </button>
    </div>
  );
}
