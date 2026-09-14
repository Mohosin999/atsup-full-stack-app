import { Loader2, ArrowRight, type LucideIcon } from "lucide-react";

interface ActionButtonProps {
  label: string;
  loadingLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void;
  icon?: LucideIcon;
  variant?: "cyan" | "violet";
}

const variants = {
  cyan: {
    base: "bg-cyan-600 hover:bg-cyan-700 shadow-lg shadow-cyan-500/30",
    hover: "hover:from-cyan-700 hover:to-cyan-800",
  },
  violet: {
    base: "bg-gradient-to-r from-violet-600 to-fuchsia-500 shadow-lg shadow-violet-500/30",
    hover: "hover:from-violet-700 hover:to-fuchsia-600",
  },
};

export default function ActionButton({
  label,
  loadingLabel,
  loading = false,
  disabled = false,
  onClick,
  icon: Icon,
  variant = "violet",
}: ActionButtonProps) {
  const v = variants[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 text-sm font-semibold text-white rounded-xl active:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none ${v.base}`}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          {loadingLabel || "Processing..."}
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4" />}
          {label}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </>
      )}
    </button>
  );
}
