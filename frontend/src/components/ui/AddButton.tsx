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
      className={`inline-flex items-center gap-1 px-4 py-2.5 text-xs font-medium text-blue-600 dark:text-cyan-500 hover:bg-cyan-600 hover:text-white ${className}`}
    >
      <Plus className="w-4 h-4" />
      {children}
    </button>
  );
}
