/* ===================================
Skills Form (categorized)
=================================== */
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "../ui/FormField";
import { SkillCategory } from "../../types";

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
  categories: SkillCategory[];
  onChange: (categories: SkillCategory[]) => void;
}

/**
 * Comma-separated skills input. Keeps the raw text locally so commas are not
 * swallowed on each keystroke; commits to the skills array on blur/Enter.
 */
function SkillTextInput({
  value,
  onCommit,
}: {
  value: string[];
  onCommit: (skills: string[]) => void;
}) {
  const [text, setText] = useState(value.join(", "));

  useEffect(() => {
    setText(value.join(", "));
  }, [value]);

  const commit = (next?: string) => {
    const raw = next ?? text;
    onCommit(
      raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    );
  };

  return (
    <input
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => commit()}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          commit();
          (e.target as HTMLInputElement).blur();
        }
      }}
      className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
      placeholder="React, Node.js, TypeScript"
    />
  );
}

export default function SkillsForm({ categories, onChange }: SkillsFormProps) {
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
    onChange(
      categories.map((c, i) => (i === index ? { ...c, skills } : c)),
    );

  const removeCategory = (index: number) =>
    onChange(categories.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      {categories.map((cat, index) => (
        <div
          key={index}
          className="rounded-lg border border-gray-200 bg-gray-100 p-3 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700">
              Category {index + 1}
            </span>
            <button
              type="button"
              onClick={() => removeCategory(index)}
              className="text-gray-600 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Category Name
            </label>
            <input
              list="skill-category-presets"
              value={cat.name || ""}
              onChange={(e) => updateName(index, e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. Technical Skills"
            />
            <datalist id="skill-category-presets">
              {PRESET_CATEGORIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Skills (comma separated)
            </label>
            <SkillTextInput
              value={cat.skills || []}
              onCommit={(skills) => updateSkills(index, skills)}
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addCategory}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-dashed border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-600 transition-colors"
      >
        <Plus className="w-4 h-4" /> Add Skill Category
      </button>

      {categories.length === 0 && (
        <p className="text-xs text-gray-500">
          Tip: Add categories like Technical Skills and Soft Skills. Each
          category appears on its own line in the resume.
        </p>
      )}
    </div>
  );
}