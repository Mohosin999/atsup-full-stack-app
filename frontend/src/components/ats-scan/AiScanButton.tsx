import { Loader2 } from "lucide-react";

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
        className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 text-sm font-semibold bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg"
      >
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {loading ? "Analyzing..." : "Scan Now"}
      </button>

      {noCredit && (
        <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block whitespace-nowrap z-10">
          <div className="bg-gray-900 text-white text-xs font-medium px-3 py-1.5 shadow-lg">
            No credit available, wait for next day
          </div>
          <div className="mx-auto w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-900" />
        </div>
      )}
    </div>
  );
}
