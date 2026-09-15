/* ===================================
Skills Form (categorized) with drag & drop
=================================== */
import { useState } from "react";
import { Plus, Trash2, X, GripVertical } from "lucide-react";
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
  rectSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SkillCategory } from "../../types";
import AddButton from "../ui/AddButton";
import ConfirmModal from "../ui/ConfirmModal";

const PRESET_CATEGORIES = [
  "Technical Skills",
  "Soft Skills",
  "Programming Languages",
  "Frameworks & Libraries",
  "Databases",
  "Tools & Technologies",
  "Languages",
];

interface SkillsFormProps {
  skills: string[];
  onSkillsChange: (skills: string[]) => void;
  categories: SkillCategory[];
  onChange: (categories: SkillCategory[]) => void;
}

/**
 * Standalone skill input. Type a skill and press Enter (or comma) to commit.
 * Backspace on an empty input removes the last chip.
 */
function SkillTagInput({
  onAdd,
  onRemoveLast,
  placeholder,
}: {
  onAdd: (skills: string[]) => void;
  onRemoveLast: () => void;
  placeholder?: string;
}) {
  const [text, setText] = useState("");

  const addSkills = (raw: string) => {
    const next = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (next.length === 0) return;
    onAdd(next);
    setText("");
  };

  return (
    <input
      value={text}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === ",") {
          e.preventDefault();
          addSkills(text);
        } else if (e.key === "Backspace" && !text) {
          onRemoveLast();
        }
      }}
      onBlur={() => addSkills(text)}
      className="w-full px-4 py-2 lg:py-3 text-xs md:text-sm border border-stone-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800/40 text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-lime-300 focus:border-transparent transition-all font-plex"
      placeholder={placeholder || "Type a skill and press Enter"}
    />
  );
}

/**
 * A single draggable skill chip.
 */
function SortableChip({
  id,
  onRemove,
  children,
}: {
  id: string;
  onRemove: () => void;
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
    <span
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`font-plex inline-flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-2.5 py-1 text-xs md:text-sm text-stone-800 dark:text-stone-100 select-none rounded-lg ${
        isDragging ? "opacity-60 z-10 shadow-md" : ""
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        title="Drag to reorder"
        className="flex items-center text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 cursor-grab active:cursor-grabbing touch-none transition-colors"
      >
        <GripVertical className="w-3 h-3" />
      </button>
      {children}
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onRemove}
        className="text-stone-500 dark:text-stone-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        aria-label={`Remove ${children}`}
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

/**
 * Reorderable skill chips (flex-wrap layout).
 */
function SortableChipList({
  value,
  onChange,
  onRemove,
}: {
  value: string[];
  onChange: (skills: string[]) => void;
  onRemove: (skill: string) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = value.indexOf(active.id as string);
    const newIndex = value.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;
    onChange(arrayMove(value, oldIndex, newIndex));
  };

  if (value.length === 0) return null;
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={value} strategy={rectSortingStrategy}>
        <div className="flex flex-wrap gap-1.5">
          {value.map((skill) => (
            <SortableChip
              key={skill}
              id={skill}
              onRemove={() => onRemove(skill)}
            >
              {skill}
            </SortableChip>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

/**
 * Input + chips stacked. Used for direct (uncategorized) skills.
 */
function SkillTagsInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (skills: string[]) => void;
  placeholder?: string;
}) {
  const onAdd = (next: string[]) =>
    onChange(
      Array.from(
        new Set([...value.map((s) => s.trim()).filter(Boolean), ...next]),
      ),
    );
  const onRemoveLast = () => onChange(value.slice(0, -1));
  const onRemove = (skill: string) =>
    onChange(value.filter((s) => s !== skill));

  return (
    <div>
      <SkillTagInput
        onAdd={onAdd}
        onRemoveLast={onRemoveLast}
        placeholder={placeholder}
      />
      <div className="mt-2">
        <SortableChipList
          value={value}
          onChange={onChange}
          onRemove={onRemove}
        />
      </div>
    </div>
  );
}

/**
 * A draggable skill category card.
 */
function SortableCategory({
  id,
  cat,
  index,
  onNameChange,
  onSkillsChange,
  onRemove,
}: {
  id: string;
  cat: SkillCategory;
  index: number;
  onNameChange: (name: string) => void;
  onSkillsChange: (skills: string[]) => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const [confirmRemove, setConfirmRemove] = useState(false);

  const onRemoveSkill = (skill: string) =>
    onSkillsChange((cat.skills || []).filter((s) => s !== skill));
  const onReorderSkills = (skills: string[]) => onSkillsChange(skills);

  const onAddSkills = (next: string[]) =>
    onSkillsChange(
      Array.from(
        new Set([
          ...(cat.skills || []).map((s) => s.trim()).filter(Boolean),
          ...next,
        ]),
      ),
    );

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`font-plex border border-stone-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-900 p-4 space-y-3 ${
        isDragging ? "opacity-70 z-10 shadow-md" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            {...attributes}
            {...listeners}
            title="Drag to reorder category"
            className="text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 cursor-grab active:cursor-grabbing touch-none transition-colors"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <span className="text-xs md:text-sm font-semibold text-stone-700 dark:text-stone-200">
            Cat. {index + 1}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setConfirmRemove(true)}
          className="text-stone-500 dark:text-stone-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <input
            list="skill-category-presets"
            value={cat.name || ""}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full px-4 py-2 lg:py-3 text-xs md:text-sm border border-stone-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800/40 text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-lime-300 focus:border-transparent transition-all font-plex"
            placeholder="e.g. Technical Skills"
          />
        </div>

        <div>
          <SkillTagInput
            onAdd={onAddSkills}
            onRemoveLast={() => onSkillsChange((cat.skills || []).slice(0, -1))}
          />
        </div>
      </div>

      <div className="pt-1">
        <SortableChipList
          value={cat.skills || []}
          onChange={onReorderSkills}
          onRemove={onRemoveSkill}
        />
      </div>

      <ConfirmModal
        isOpen={confirmRemove}
        title="Delete skill category?"
        message={`Are you sure you want to delete "${cat.name || "this category"}"?`}
        confirmText="Delete"
        onConfirm={() => {
          setConfirmRemove(false);
          onRemove();
        }}
        onCancel={() => setConfirmRemove(false)}
      />
    </div>
  );
}

export default function SkillsForm({
  skills,
  onSkillsChange,
  categories,
  onChange,
}: SkillsFormProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const addCategory = () =>
    onChange([
      ...categories,
      {
        name:
          PRESET_CATEGORIES[categories.length % PRESET_CATEGORIES.length] ||
          "Technical Skills",
        skills: [],
      },
    ]);

  const updateName = (index: number, name: string) =>
    onChange(categories.map((c, i) => (i === index ? { ...c, name } : c)));

  const updateSkills = (index: number, skills: string[]) =>
    onChange(categories.map((c, i) => (i === index ? { ...c, skills } : c)));

  const removeCategory = (index: number) =>
    onChange(categories.filter((_, i) => i !== index));

  const handleCategoryDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = categories.findIndex((_, i) => `cat-${i}` === active.id);
    const newIndex = categories.findIndex((_, i) => `cat-${i}` === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onChange(arrayMove(categories, oldIndex, newIndex));
  };

  return (
    <div className="font-plex w-full space-y-3">
      <div>
        <label className="block text-xs md:text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
          Add your own skill
        </label>
        <SkillTagsInput
          value={skills}
          onChange={onSkillsChange}
          placeholder="Type a skill and press Enter"
        />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleCategoryDragEnd}
      >
        <SortableContext
          items={categories.map((_, i) => `cat-${i}`)}
          strategy={verticalListSortingStrategy}
        >
          {categories.map((cat, index) => (
            <SortableCategory
              key={index}
              id={`cat-${index}`}
              cat={cat}
              index={index}
              onNameChange={(name) => updateName(index, name)}
              onSkillsChange={(catSkills) => updateSkills(index, catSkills)}
              onRemove={() => removeCategory(index)}
            />
          ))}
        </SortableContext>
      </DndContext>
      
      <AddButton onClick={addCategory}>Add Skill Category</AddButton>

      {categories.length === 0 && (
        <p className="text-xs md:text-sm text-stone-500 dark:text-stone-400">
          Tip: Add categories like Technical Skills and Soft Skills. Each
          category appears on its own line in the resume.
        </p>
      )}
    </div>
  );
}
