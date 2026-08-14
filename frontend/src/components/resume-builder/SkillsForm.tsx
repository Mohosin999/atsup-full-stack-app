/* ===================================
Skills Form (categorized)
=================================== */
import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
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
      className="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-xs"
      placeholder={placeholder || "Type a skill and press Enter"}
    />
  );
}

/**
 * Removable skill chips.
 */
function SkillChips({
  value,
  onRemove,
}: {
  value: string[];
  onRemove: (skill: string) => void;
}) {
  if (value.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {value.map((skill) => (
        <span
          key={skill}
          className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-2.5 py-1 text-xs text-green-800"
        >
          {skill}
          <button
            type="button"
            onClick={() => onRemove(skill)}
            className="text-green-600 hover:text-red-600 transition-colors"
            aria-label={`Remove ${skill}`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
    </div>
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
        <SkillChips value={value} onRemove={onRemove} />
      </div>
    </div>
  );
}

export default function SkillsForm({
  skills,
  onSkillsChange,
  categories,
  onChange,
}: SkillsFormProps) {
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

  return (
    <div className="space-y-3">
      {/* ===========================================================
       * All skills together without categories
       =========================================================== */}
      <div className="rounded-lg  p-3 space-y-3">
        {/* <div>
          <span className="text-xs font-semibold text-gray-700">
            Add your own skill
          </span>
        </div> */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Add your own skill
          </label>
          <SkillTagsInput
            value={skills}
            onChange={onSkillsChange}
            placeholder="Type a skill and press Enter"
          />
          {/* <p className="text-xs text-gray-500 mt-1.5">
            No category? Just add skills here — they appear as a single line on
            the resume.
          </p> */}
        </div>
      </div>

      {categories.map((cat, index) => (
        <div
          key={index}
          className="rounded-lg p-3 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700">
              Cat. {index + 1}
            </span>
            <button
              type="button"
              onClick={() => removeCategory(index)}
              className="text-gray-600 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              {/* <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Category Name
              </label> */}
              <input
                list="skill-category-presets"
                value={cat.name || ""}
                onChange={(e) => updateName(index, e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-xs"
                placeholder="e.g. Technical Skills"
              />
              {/* <datalist id="skill-category-presets">
                {PRESET_CATEGORIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist> */}
            </div>

            <div>
              {/* <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Skills
              </label> */}
              <SkillTagInput
                onAdd={(next) =>
                  updateSkills(
                    index,
                    Array.from(
                      new Set([
                        ...(cat.skills || [])
                          .map((s) => s.trim())
                          .filter(Boolean),
                        ...next,
                      ]),
                    ),
                  )
                }
                onRemoveLast={() =>
                  updateSkills(index, (cat.skills || []).slice(0, -1))
                }
              />
            </div>
          </div>

          {(cat.skills || []).length > 0 && (
            <div className="pt-1">
              <SkillChips
                value={cat.skills || []}
                onRemove={(skill) =>
                  updateSkills(
                    index,
                    (cat.skills || []).filter((s) => s !== skill),
                  )
                }
              />
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addCategory}
        className="inline-flex items-center gap-1 px-4 py-2.5 text-xs font-medium text-gray-700 hover:border-green-500 hover:text-green-600 transition-colors"
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
