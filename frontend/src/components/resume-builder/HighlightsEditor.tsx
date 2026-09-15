/* ===================================
Bullet Point (Highlights) Editor
Each added item appears as a bullet
point in the resume preview.
=================================== */
import { useEffect, useRef, useState } from "react";
import { Plus, X, Trash2, GripVertical, Check } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import AddButton from "../ui/AddButton";
import ConfirmModal from "../ui/ConfirmModal";

interface HighlightsEditorProps {
  highlights: string[];
  onAdd: (text: string) => void;
  onUpdate: (index: number, text: string) => void;
  onRemove: (index: number) => void;
  onReorder: (highlights: string[]) => void;
  placeholder?: string;
}

function SortableHighlight({
  id,
  onDelete,
  onStartEdit,
  editing,
  editValue,
  onEditChange,
  onEditSave,
  onEditCancel,
  children,
}: {
  id: string;
  onDelete: () => void;
  onStartEdit: () => void;
  editing: boolean;
  editValue: string;
  onEditChange: (value: string) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wasEditingRef = useRef(false);

  useEffect(() => {
    if (editing && textareaRef.current) {
      const el = textareaRef.current;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
      if (!wasEditingRef.current) {
        const len = el.value.length;
        el.setSelectionRange(len, len);
      }
      wasEditingRef.current = true;
    } else {
      wasEditingRef.current = false;
    }
  }, [editing]);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`font-plex flex items-start gap-2 border px-4 py-2 lg:py-3 bg-white dark:bg-stone-800/40 rounded-lg transition-all ${
        isDragging ? "opacity-70 z-10 shadow-md" : ""
      } ${editing ? "border-stone-900 dark:border-lime-300 ring-2 ring-stone-900 dark:ring-lime-300" : "border-stone-200 dark:border-stone-700"}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        title="Drag to reorder"
        className="text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 mt-0.5 flex-shrink-0 cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      {editing ? (
        <textarea
          ref={textareaRef}
          value={editValue}
          onChange={(e) => onEditChange(e.target.value)}
          onBlur={onEditSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onEditSave();
            }
            if (e.key === "Escape") {
              e.preventDefault();
              onEditCancel();
            }
          }}
          autoFocus
          rows={1}
          placeholder="e.g. Increased website traffic by 40% through SEO optimization"
          className="flex-1 text-xs md:text-sm leading-5 md:leading-6 text-stone-800 dark:text-stone-100 bg-transparent placeholder-stone-400 dark:placeholder-stone-500 resize-none overflow-hidden focus:outline-none"
        />
      ) : (
        <span
          className="flex-1 text-xs md:text-sm leading-5 md:leading-6 text-stone-700 dark:text-stone-100 break-words cursor-text px-1 py-0.5 -mx-1"
          onClick={onStartEdit}
          title="Click to edit"
        >
          {children}
        </span>
      )}
      {editing && (
        <button
          type="button"
          onClick={onEditSave}
          className="text-stone-900 dark:text-lime-300 hover:bg-stone-100 dark:hover:bg-stone-700 mt-0.5 flex-shrink-0 p-0.5 rounded"
          title="Save"
        >
          <Check className="w-4 h-4" />
        </button>
      )}
      <button
        type="button"
        onClick={onDelete}
        className="text-stone-500 dark:text-stone-400 hover:text-red-600 dark:hover:text-red-400 mt-0.5 flex-shrink-0 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function HighlightsEditor({
  highlights,
  onAdd,
  onUpdate,
  onRemove,
  onReorder,
  placeholder,
}: HighlightsEditorProps) {
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);
  const [removeIndex, setRemoveIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = highlights.indexOf(active.id as string);
    const newIndex = highlights.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(highlights, oldIndex, newIndex));
  };

  const startAdding = () => {
    setText("");
    setAdding(true);
  };

  const handleSave = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText("");
    setAdding(false);
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditText(highlights[index]);
  };

  const saveEdit = () => {
    if (editingIndex === null) return;
    const trimmed = editText.trim();
    const current = highlights[editingIndex];
    if (trimmed && trimmed !== current) {
      onUpdate(editingIndex, trimmed);
    }
    setEditingIndex(null);
    setEditText("");
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditText("");
  };

  return (
    <div className="font-plex w-full">
      {/* ============================================================
        * Bullet point list
      ============================================================ */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={highlights}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {highlights.map((highlight, index) => (
              <SortableHighlight
                key={`${highlight}-${index}`}
                id={highlight}
                onDelete={() => setRemoveIndex(index)}
                onStartEdit={() => startEdit(index)}
                editing={editingIndex === index}
                editValue={editText}
                onEditChange={setEditText}
                onEditSave={saveEdit}
                onEditCancel={cancelEdit}
              >
                {highlight}
              </SortableHighlight>
            ))}

            {highlights.length === 0 && (
              <p className="text-xs md:text-sm text-stone-500 dark:text-stone-400">
                No bullet points added yet.
              </p>
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* ============================================================
        * Add new bullet point
      ============================================================ */}
      {adding && (
        <div className="flex items-start gap-2 border border-stone-200 dark:border-stone-700 px-4 py-2 lg:py-3 bg-white dark:bg-stone-800/40 mt-2 rounded-lg transition-all focus-within:ring-2 focus-within:ring-stone-900 dark:focus-within:ring-lime-300 focus-within:border-transparent">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSave();
              } else if (e.key === "Escape") {
                setAdding(false);
              }
            }}
            placeholder={
              placeholder ||
              "e.g. Increased website traffic by 40% through SEO optimization"
            }
            autoFocus
            className="flex-1 text-xs md:text-sm text-stone-800 dark:text-stone-100 bg-transparent placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={!text.trim()}
            className="text-xs md:text-sm font-medium text-stone-900 dark:text-lime-300 hover:text-stone-700 dark:hover:text-lime-200 disabled:text-stone-300 dark:disabled:text-stone-600 flex-shrink-0 mt-0.5 transition-colors"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setAdding(false)}
            className="text-stone-400 dark:text-stone-500 hover:text-red-600 dark:hover:text-red-400 mt-0.5 flex-shrink-0 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <AddButton onClick={startAdding} className="mt-2">
        Add Bullet Point
      </AddButton>

      <ConfirmModal
        isOpen={removeIndex !== null}
        title="Delete bullet point?"
        message="Are you sure you want to delete this bullet point? This action cannot be undone."
        confirmText="Delete"
        onConfirm={() => {
          if (removeIndex !== null) onRemove(removeIndex);
          setRemoveIndex(null);
        }}
        onCancel={() => setRemoveIndex(null)}
      />
    </div>
  );
}
