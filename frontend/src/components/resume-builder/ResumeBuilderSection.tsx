/* ===================================
Collapsible Resume Builder Section
=================================== */
import { useEffect, useRef, useState } from "react";
import { ChevronDown, GripVertical, Pencil } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ResumeBuilderSectionProps {
  title: string;
  onTitleChange?: (title: string) => void;
  subtitle?: string;
  defaultOpen?: boolean;
  sortableId?: string;
  children: React.ReactNode;
}

export default function ResumeBuilderSection({
  title,
  onTitleChange,
  subtitle,
  defaultOpen = false,
  sortableId,
  children,
}: ResumeBuilderSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  const sortable = sortableId
    ? useSortable({ id: sortableId })
    : null;
  const sortableStyle = sortable
    ? {
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition,
      }
    : undefined;

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
    <div
      ref={sortable ? sortable.setNodeRef : undefined}
      style={sortableStyle}
      className={sortable && sortable.isDragging ? "relative z-10 opacity-90" : ""}
    >
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
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
                    className="text-sm font-semibold text-gray-800 dark:text-gray-100 h-5 px-1.5 py-0 border border-cyan-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:border-cyan-500"
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
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{subtitle}</p>
                )}
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0 transition-transform duration-200 ml-2 ${
                  open ? "rotate-180" : ""
                }`}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {sortable && (
                <button
                  type="button"
                  {...sortable.attributes}
                  {...sortable.listeners}
                  title="Drag to reorder section"
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing flex-shrink-0 touch-none"
                >
                  <GripVertical className="w-4 h-4" />
                </button>
              )}
              {!sortable && (
                <span className="w-4 flex-shrink-0" aria-hidden="true" />
              )}
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex-1 flex items-center justify-between text-left min-w-0"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 group/title">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
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
                        className="text-gray-400 dark:text-gray-500 hover:text-cyan-600 transition-colors cursor-pointer flex-shrink-0 opacity-0 group-hover/title:opacity-100 focus-visible:opacity-100"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  {subtitle && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{subtitle}</p>
                  )}
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0 transition-transform duration-200 ml-2 ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          )}
        </div>
        {open && (
          <div className="px-4 pb-4 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-4">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
