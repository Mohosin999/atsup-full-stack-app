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
      className={`inline-flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
        active
          ? "bg-cyan-100 text-cyan-700"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <span className="inline-flex items-center">
        <Icon className="w-4 h-4 me-2" />
        {label}
      </span>
      {typeof badge === "number" && badge > 0 && (
        <span className="inline-flex items-center ml-4 px-1.5 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">
          {badge}
        </span>
      )}
    </button>
  );
};

export default SidebarButton;