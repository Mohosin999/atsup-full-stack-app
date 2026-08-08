/* ===================================
Collapsible Resume Builder Section
=================================== */
import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface ResumeBuilderSectionProps {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export default function ResumeBuilderSection({
  title,
  subtitle,
  defaultOpen = false,
  children,
}: ResumeBuilderSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-100 transition-colors"
      >
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {subtitle && (
            <p className="text-xs text-gray-600 mt-0.5">{subtitle}</p>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-600 flex-shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-3 border-t border-gray-200 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}
