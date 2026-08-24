import Button from "../ui/Button";

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
      <Button
        variant="primary"
        onClick={onClick}
        disabled={disabled}
        loading={loading}
      >
        {loading ? "Analyzing..." : "AI Scan"}
      </Button>

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