import { Plus } from "lucide-react";

type AddButtonProps = {
  onClick: () => void;
  children?: React.ReactNode;
  className?: string;
};

export default function AddButton({
  onClick,
  children = "Add",
  className = "",
}: AddButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-plex inline-flex items-center gap-1 px-4 py-2.5 text-xs font-medium text-stone-900 dark:text-lime-300 hover:text-stone-700 dark:hover:text-lime-200 transition-colors ${className}`}
    >
      <Plus className="w-4 h-4" />
      {children}
    </button>
  );
}
