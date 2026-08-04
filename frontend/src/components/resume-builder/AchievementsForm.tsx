/* ===================================
Achievements Form
=================================== */
import { Plus, Trash2 } from "lucide-react";
import { Input, Textarea } from "../ui/FormField";
import { Achievement } from "../../types";

interface AchievementsFormProps {
  achievements: Achievement[];
  onAdd: () => void;
  onUpdate: (index: number, patch: Partial<Achievement>) => void;
  onRemove: (index: number) => void;
}

export default function AchievementsForm({
  achievements,
  onAdd,
  onUpdate,
  onRemove,
}: AchievementsFormProps) {
  return (
    <div className="space-y-3">
      {achievements.map((ach, index) => (
        <div
          key={index}
          className="rounded-lg border border-gray-200 bg-gray-100 p-3 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700">
              Achievement {index + 1}
            </span>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="text-gray-600 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Title"
              value={ach.title || ""}
              onChange={(e) => onUpdate(index, { title: e.target.value })}
              placeholder="Winner, National Hackathon 2024"
            />
            <Input
              label="Date"
              value={ach.date || ""}
              onChange={(e) => onUpdate(index, { date: e.target.value })}
              placeholder="2024"
            />
            <div className="sm:col-span-2">
              <Textarea
                label="Description (optional)"
                value={ach.description || ""}
                onChange={(e) =>
                  onUpdate(index, { description: e.target.value })
                }
                rows={2}
                placeholder="Short description of the achievement"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={onAdd}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-dashed border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-600 transition-colors"
      >
        <Plus className="w-4 h-4" /> Add Achievement
      </button>
    </div>
  );
}
