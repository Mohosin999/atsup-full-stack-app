/* ===================================
Bullet Point (Highlights) Editor
Each added item appears as a bullet
point in the resume preview.
=================================== */
import { useState } from "react";
import { Plus, X, Trash2, GripVertical } from "lucide-react";
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
  onRemove: (index: number) => void;
  onReorder: (highlights: string[]) => void;
  placeholder?: string;
}

function SortableHighlight({
  id,
  onDelete,
  children,
}: {
  id: string;
  onDelete: () => void;
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

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-start gap-2 border border-gray-200 rounded-lg px-3 py-3 bg-white ${
        isDragging ? "opacity-70 z-10 shadow-md" : ""
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        title="Drag to reorder"
        className="text-gray-400 hover:text-gray-700 mt-0.5 flex-shrink-0 cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <span className="flex-1 text-xs text-gray-700 break-words">
        {children}
      </span>
      <button
        type="button"
        onClick={onDelete}
        className="text-gray-600 hover:text-red-600 mt-0.5 flex-shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function HighlightsEditor({
  highlights,
  onAdd,
  onRemove,
  onReorder,
  placeholder,
}: HighlightsEditorProps) {
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);
  const [removeIndex, setRemoveIndex] = useState<number | null>(null);
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

  return (
    <div>
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
              >
                {highlight}
              </SortableHighlight>
            ))}
            {highlights.length === 0 && (
              <p className="text-xs text-gray-500">
                No bullet points added yet.
              </p>
            )}
          </div>
        </SortableContext>
      </DndContext>

      {adding && (
        <div className="flex items-start gap-2 border border-gray-200 rounded-lg px-3 py-3 bg-white mt-2">
          {/* <Plus className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" /> */}
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
            // placeholder={
            //   placeholder ||
            //   "e.g. Increased website traffic by 40% through SEO optimization"
            // }
            autoFocus
            className="flex-1 text-xs text-gray-700 bg-white focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={!text.trim()}
            className="text-xs font-medium text-emerald-600 hover:text-emerald-700 disabled:text-gray-300 flex-shrink-0 mt-0.5"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setAdding(false)}
            className="text-gray-400 hover:text-red-600 mt-0.5 flex-shrink-0"
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
