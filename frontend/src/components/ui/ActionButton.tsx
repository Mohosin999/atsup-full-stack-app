// import { Loader2, ArrowRight, type LucideIcon } from "lucide-react";

// interface ActionButtonProps {
//   label: string;
//   loadingLabel?: string;
//   loading?: boolean;
//   disabled?: boolean;
//   onClick: () => void;
//   icon?: LucideIcon;
//   variant?: "cyan" | "violet";
// }

// const variants = {
//   cyan: {
//     base: "bg-cyan-600 hover:bg-cyan-700 shadow-lg shadow-cyan-500/30",
//     hover: "hover:from-cyan-700 hover:to-cyan-800",
//   },
//   violet: {
//     base: "bg-gradient-to-r from-violet-600 to-fuchsia-500 shadow-lg shadow-violet-500/30",
//     hover: "hover:from-violet-700 hover:to-fuchsia-600",
//   },
// };

// export default function ActionButton({
//   label,
//   loadingLabel,
//   loading = false,
//   disabled = false,
//   onClick,
//   icon: Icon,
//   variant = "violet",
// }: ActionButtonProps) {
//   const v = variants[variant];

//   return (
//     <button
//       onClick={onClick}
//       disabled={disabled || loading}
//       className={`group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 text-sm font-semibold text-white rounded-xl active:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none ${v.base}`}
//     >
//       {loading ? (
//         <>
//           <Loader2 className="w-4 h-4 animate-spin" />
//           {loadingLabel || "Processing..."}
//         </>
//       ) : (
//         <>
//           {Icon && <Icon className="w-4 h-4" />}
//           {label}
//           <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
//         </>
//       )}
//     </button>
//   );
// }

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
  cyan: "bg-stone-900 hover:bg-stone-800 text-stone-50 dark:bg-lime-300 dark:hover:bg-lime-200 dark:text-stone-900 shadow-md shadow-stone-900/10 dark:shadow-none",
  violet:
    "bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/20",
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
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`font-plex group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 text-sm font-semibold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none ${variants[variant]}`}
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
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </>
      )}
    </button>
  );
}