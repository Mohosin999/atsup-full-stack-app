/* ===================================
Collapsible Resume Builder Section
=================================== */
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Pencil } from "lucide-react";

interface ResumeBuilderSectionProps {
  title: string;
  onTitleChange?: (title: string) => void;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export default function ResumeBuilderSection({
  title,
  onTitleChange,
  subtitle,
  defaultOpen = false,
  children,
}: ResumeBuilderSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (editing && inputRef.current && measureRef.current) {
      const textWidth = measureRef.current.offsetWidth;
      inputRef.current.style.width = `${Math.min(textWidth + 20, 480)}px`;
    }
  }, [draft, editing]);

  const startEdit = () => {
    setDraft(title);
    setEditing(true);
  };

  const commit = () => {
    setEditing(false);
    if (!onTitleChange) return;
    const trimmed = draft.trim();
    if (trimmed && trimmed !== title) onTitleChange(trimmed);
  };

  const cancel = () => {
    setDraft(title);
    setEditing(false);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 py-3">
        {editing ? (
          <div className="w-full flex items-center justify-between text-left min-w-0">
            <div className="min-w-0">
              <div className="relative inline-block">
                <input
                  ref={inputRef}
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={commit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commit();
                    if (e.key === "Escape") cancel();
                  }}
                  autoFocus
                  maxLength={60}
                  placeholder={title}
                  className="text-sm font-semibold text-gray-900 h-5 px-1.5 py-0 rounded-sm border border-green-300 bg-white focus:outline-none focus:border-green-500"
                />
                <span
                  ref={measureRef}
                  aria-hidden="true"
                  className="invisible whitespace-pre absolute top-0 left-0 text-sm font-semibold"
                >
                  {draft || title}
                </span>
              </div>
              {subtitle && (
                <p className="text-xs text-gray-600 mt-0.5">{subtitle}</p>
              )}
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-600 flex-shrink-0 transition-transform duration-200 ml-2 ${
                open ? "rotate-180" : ""
              }`}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="w-full flex items-center justify-between text-left min-w-0"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 group/title">
                <h3 className="text-sm font-semibold text-gray-900">
                  {title}
                </h3>
                {onTitleChange && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.stopPropagation();
                        startEdit();
                      }
                    }}
                    title="Edit section title"
                    className="text-gray-400 hover:text-emerald-600 transition-colors cursor-pointer flex-shrink-0 opacity-0 group-hover/title:opacity-100 focus-visible:opacity-100"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-xs text-gray-600 mt-0.5">{subtitle}</p>
              )}
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-600 flex-shrink-0 transition-transform duration-200 ml-2 ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>
        )}
      </div>
      {open && (
        <div className="px-4 pb-4 pt-3 border-t border-gray-200 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}
