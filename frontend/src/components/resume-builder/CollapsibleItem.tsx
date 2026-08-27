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
    <div className="border border-gray-200 overflow-hidden rounded-md">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex-1 flex items-center gap-2 text-left min-w-0"
        >
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-700 truncate">
              {title}
            </p>
            {subtitle && (
              <p className="text-[11px] text-gray-500 truncate">{subtitle}</p>
            )}
          </div>
        </button>
        {onRemove && (
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            aria-label="Remove item"
            className="text-gray-600 hover:text-red-600 flex-shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Collapse item" : "Expand item"}
          className="text-gray-500 hover:text-gray-800 flex-shrink-0"
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
      {open && (
        <div className="px-3 pb-3 pt-3 border-t border-gray-200 space-y-3">
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
