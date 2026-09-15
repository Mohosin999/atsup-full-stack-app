/* ===================================
Collapsible single item card
Used for each experience / project /
education / achievement / certification
=================================== */
import { useState } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import ConfirmModal from "../ui/ConfirmModal";

interface CollapsibleItemProps {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  onRemove?: () => void;
  children: React.ReactNode;
}

export default function CollapsibleItem({
  title,
  subtitle,
  defaultOpen = false,
  onRemove,
  children,
}: CollapsibleItemProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="font-plex border border-stone-200 dark:border-stone-700 overflow-hidden rounded-lg bg-white dark:bg-stone-900">
      <div className="flex items-center gap-2 px-4 py-2.5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex-1 flex items-center gap-2 text-left min-w-0"
        >
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-semibold text-stone-700 dark:text-stone-200 truncate">
              {title}
            </p>
            {subtitle && (
              <p className="text-[11px] md:text-xs text-stone-500 dark:text-stone-400 truncate">{subtitle}</p>
            )}
          </div>
        </button>
        {onRemove && (
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            aria-label="Remove item"
            className="text-stone-500 dark:text-stone-400 hover:text-red-600 dark:hover:text-red-400 flex-shrink-0 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Collapse item" : "Expand item"}
          className="text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 flex-shrink-0 transition-colors"
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
      {open && (
        <div className="px-4 pb-4 pt-3 border-t border-stone-200 dark:border-stone-700 space-y-3">
          {children}
        </div>
      )}
      {onRemove && (
        <ConfirmModal
          isOpen={confirmOpen}
          title="Delete item?"
          message={`Are you sure you want to delete "${title}"? This action cannot be undone.`}
          confirmText="Delete"
          onConfirm={() => {
            setConfirmOpen(false);
            onRemove();
          }}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
}
