// import { LucideIcon } from "lucide-react";

// interface SidebarButtonProps {
//   icon: LucideIcon;
//   label: string;
//   active: boolean;
//   badge?: number;
//   onClick: () => void;
// }

// const SidebarButton: React.FC<SidebarButtonProps> = ({
//   icon: Icon,
//   label,
//   active,
//   badge,
//   onClick,
// }) => {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       className={`inline-flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
//         active
//       ? "text-cyan-600"
//       : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
//       }`}
//     >
//       <span className="inline-flex items-center">
//         <Icon className="w-4 h-4 me-2" />
//         {label}
//       </span>
//       {typeof badge === "number" && badge > 0 && (
//         <span className="inline-flex items-center ml-4 px-1.5 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">
//           {badge}
//         </span>
//       )}
//     </button>
//   );
// };

// export default SidebarButton;

import { LucideIcon } from "lucide-react";

interface SidebarButtonProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  badge?: number;
  onClick: () => void;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({
  icon: Icon,
  label,
  active,
  badge,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-plex inline-flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
        active
          ? "bg-stone-900 dark:bg-lime-300 text-stone-50 dark:text-stone-900"
          : "text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
      }`}
    >
      <span className="inline-flex items-center">
        <Icon className="w-4 h-4 me-2" />
        {label}
      </span>
      {typeof badge === "number" && badge > 0 && (
        <span
          className={`inline-flex items-center ml-4 px-1.5 py-0.5 text-xs font-semibold rounded-full ${
            active
              ? "bg-white/20 text-stone-50 dark:bg-stone-900/20 dark:text-stone-900"
              : "bg-red-100 text-red-700 dark:bg-red-400/15 dark:text-red-400"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
};

export default SidebarButton;